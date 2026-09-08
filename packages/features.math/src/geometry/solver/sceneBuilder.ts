import type { GeometrySemanticModel } from '../semantic/types';
import { formatGeometryScalar } from '../solver/math';
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
  let parallelGroup = 0;
  let equalAngleGroup = 0;
  const equalLengthParent = new Map<string, string>();

  const lengthKey = (segment: [string, string]) => [...segment].sort().join(':');
  const findLength = (key: string): string => {
    const parent = equalLengthParent.get(key);
    if (!parent || parent === key) {
      equalLengthParent.set(key, key);
      return key;
    }
    const root = findLength(parent);
    equalLengthParent.set(key, root);
    return root;
  };
  const unionLength = (segments: [string, string][]) => {
    const keys = segments.map(lengthKey);
    const root = findLength(keys[0]);
    for (const key of keys.slice(1)) {
      equalLengthParent.set(findLength(key), root);
    }
  };

  for (const constraint of model.constraints) {
    if (constraint.type === 'equal_length') unionLength(constraint.segments);
    if (constraint.type === 'midpoint') {
      unionLength([
        [constraint.segment[0], constraint.point],
        [constraint.point, constraint.segment[1]],
      ]);
    }
  }

  const equalLengthGroupByRoot = new Map<string, number>();
  const seenEqualLength = new Set<string>();
  const addEqualLength = (segment: [string, string]) => {
    const key = lengthKey(segment);
    if (seenEqualLength.has(key)) return;
    seenEqualLength.add(key);
    const root = findLength(key);
    let group = equalLengthGroupByRoot.get(root);
    if (group == null) {
      group = equalLengthGroupByRoot.size + 1;
      equalLengthGroupByRoot.set(root, group);
    }
    markers.push({ type: 'equal_length', segment, group });
  };

  for (const constraint of model.constraints) {
    if (constraint.type === 'angle' && Math.abs(constraint.value - 90) < 1e-6) {
      markers.push({ type: 'right_angle', points: constraint.points });
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

  const valuedAngles = model.constraints.filter(
    (constraint): constraint is Extract<GeometrySemanticModel['constraints'][number], { type: 'angle' }> =>
      constraint.type === 'angle' && Math.abs(constraint.value - 90) >= 1e-6,
  );
  const anglesByVertex = new Map<string, typeof valuedAngles>();
  for (const constraint of valuedAngles) {
    const vertex = constraint.points[1];
    const list = anglesByVertex.get(vertex) ?? [];
    list.push(constraint);
    anglesByVertex.set(vertex, list);
  }
  const angleGroup = new Map<string, number>();
  for (const list of anglesByVertex.values()) {
    list.sort((left, right) => left.value - right.value);
    list.forEach((constraint, index) => {
      const group = index + 1;
      angleGroup.set(constraint.points.join(''), group);
      markers.push({ type: 'equal_angle', points: constraint.points, group });
    });
  }

  const uniqueMarkers = markers.filter(
    (marker, index, all) =>
      all.findIndex((candidate) => JSON.stringify(candidate) === JSON.stringify(marker)) === index,
  );

  const measurementLabels: GeometryScene['measurementLabels'] = [];
  for (const constraint of model.constraints) {
    if (constraint.type === 'length') {
      measurementLabels.push({
        id: `measure-${segmentKey(constraint.segment)}`,
        segment: constraint.segment,
        text: formatGeometryScalar(constraint.value),
      });
    }
  }

  const angleLabels: GeometryScene['angleLabels'] = [];
  for (const constraint of model.constraints) {
    if (constraint.type !== 'angle' || Math.abs(constraint.value - 90) < 1e-6) continue;
    const degrees = Number.isInteger(constraint.value)
      ? String(constraint.value)
      : constraint.value.toFixed(1).replace(/\.0$/, '');
    angleLabels.push({
      id: `angle-${constraint.points.join('')}`,
      points: constraint.points,
      text: `${degrees}°`,
      group: angleGroup.get(constraint.points.join('')) ?? 1,
    });
  }

  return {
    points,
    segments,
    circles,
    markers: uniqueMarkers,
    labels: [],
    measurementLabels,
    angleLabels,
    bounds: getGeometrySceneBounds(points, circles),
  };
}

function segmentKey(segment: [string, string]): string {
  return [...segment].sort().join('');
}
