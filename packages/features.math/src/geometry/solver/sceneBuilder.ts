import type { GeometrySemanticModel } from '../semantic/types';
import { getGeometrySceneBounds } from '../scene/normalizeScene';
import type { GeometryScene, ScenePoint, SceneSegment } from '../scene/types';

export type PointCoordinates = Record<string, { x: number; y: number }>;

export function buildScene(
  model: GeometrySemanticModel,
  coordinates: PointCoordinates,
  circles: GeometryScene['circles'] = [],
): GeometryScene {
  const pointEntities = model.entities.filter((entity) => entity.type === 'point');
  const points: ScenePoint[] = Object.entries(coordinates).map(([id, coordinate]) => ({
    id,
    label: pointEntities.find((point) => point.id === id)?.label ?? id,
    ...coordinate,
  }));
  const pointIds = new Set(points.map((point) => point.id));
  const segments: SceneSegment[] = [];
  for (const entity of model.entities) {
    const line =
      entity.type === 'segment'
        ? { from: entity.from, to: entity.to, kind: 'segment' as const }
        : entity.type === 'line'
          ? { from: entity.through[0], to: entity.through[1], kind: 'line' as const }
          : entity.type === 'ray'
            ? { from: entity.from, to: entity.through, kind: 'ray' as const }
            : null;
    if (!line || !pointIds.has(line.from) || !pointIds.has(line.to)) continue;
    if (
      segments.some(
        (segment) =>
          (segment.from === line.from && segment.to === line.to) ||
          (segment.from === line.to && segment.to === line.from),
      )
    ) {
      continue;
    }
    segments.push({ id: entity.id, ...line });
  }

  const markers: GeometryScene['markers'] = [];
  const equalLengthKeys = new Set<string>();
  let parallelGroup = 0;
  let equalAngleGroup = 0;

  const addEqualLength = (segment: [string, string]) => {
    const key = [...segment].sort().join(':');
    if (equalLengthKeys.has(key)) return;
    equalLengthKeys.add(key);
    markers.push({ type: 'equal_length', segment, group: 1 });
  };

  for (const constraint of model.constraints) {
    if (constraint.type === 'angle' && Math.abs(constraint.value - 90) < 1e-6) {
      markers.push({ type: 'right_angle', points: constraint.points });
    } else if (constraint.type === 'angle') {
      markers.push({ type: 'equal_angle', points: constraint.points, group: 1 });
    }
    if (constraint.type === 'perpendicular') {
      const shared = constraint.first.find((point) => constraint.second.includes(point));
      if (shared) {
        markers.push({
          type: 'right_angle',
          points: [
            constraint.first.find((point) => point !== shared)!,
            shared,
            constraint.second.find((point) => point !== shared)!,
          ],
        });
      }
    }
    if (constraint.type === 'equal_length') {
      constraint.segments.forEach((segment) => addEqualLength(segment));
    }
    if (constraint.type === 'midpoint') {
      addEqualLength([constraint.segment[0], constraint.point]);
      addEqualLength([constraint.point, constraint.segment[1]]);
    }
    if (constraint.type === 'parallel') {
      parallelGroup += 1;
      markers.push(
        { type: 'parallel', segment: constraint.first, group: parallelGroup },
        { type: 'parallel', segment: constraint.second, group: parallelGroup },
      );
    }
    if (constraint.type === 'equal_angle') {
      equalAngleGroup += 1;
      constraint.angles.forEach((angle) =>
        markers.push({ type: 'equal_angle', points: angle, group: equalAngleGroup }),
      );
    }
  }

  const uniqueMarkers = markers.filter(
    (marker, index, all) =>
      all.findIndex((candidate) => JSON.stringify(candidate) === JSON.stringify(marker)) === index,
  );
  return {
    points,
    segments,
    circles,
    markers: uniqueMarkers,
    labels: [],
    bounds: getGeometrySceneBounds(points, circles),
  };
}
