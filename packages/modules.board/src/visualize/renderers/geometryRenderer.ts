import type { DrShapeId } from '@ibodr/draw';
import {
  getInteriorAngleArc,
  normalizeGeometryScene,
  solveGeometry,
  type GeometryIntent,
  type GeometryScene,
  type ScenePoint,
} from 'features.math';
import {
  createBoardArrow,
  createBoardCircle,
  createBoardEllipse,
  createBoardSegment,
  createBoardText,
} from './createBoardPrimitives';
import type { VisualizationRenderContext, VisualizationRenderResult } from './types';

export const GEOMETRY_TARGET_SIZE = { width: 520, height: 420, padding: 64 };

function unit(from: ScenePoint, to: ScenePoint) {
  const length = Math.max(Math.hypot(to.x - from.x, to.y - from.y), 1);
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
}

function renderMarker(
  scene: GeometryScene,
  marker: GeometryScene['markers'][number],
  context: VisualizationRenderContext,
): DrShapeId[] {
  const byId = new Map(scene.points.map((point) => [point.id, point]));
  const segment = (from: { x: number; y: number }, to: { x: number; y: number }, bend = 0) =>
    createBoardSegment(context.editor, context, context.origin.x, context.origin.y, from, to, bend);

  if (marker.type === 'right_angle') {
    const [a, vertex, c] = marker.points.map((id) => byId.get(id));
    if (!a || !vertex || !c) return [];
    const first = unit(vertex, a);
    const second = unit(vertex, c);
    const size = 22;
    const p1 = { x: vertex.x + first.x * size, y: vertex.y + first.y * size };
    const p2 = {
      x: vertex.x + (first.x + second.x) * size,
      y: vertex.y + (first.y + second.y) * size,
    };
    const p3 = { x: vertex.x + second.x * size, y: vertex.y + second.y * size };
    return [segment(p1, p2), segment(p2, p3)];
  }

  if (marker.type === 'equal_length' || marker.type === 'parallel') {
    const [a, b] = marker.segment.map((id) => byId.get(id));
    if (!a || !b) return [];
    const direction = unit(a, b);
    const perpendicular = { x: -direction.y, y: direction.x };
    const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const count =
      marker.type === 'equal_length'
        ? Math.min(Math.max(marker.group, 1), 3)
        : Math.min(marker.group, 3);
    const ids: DrShapeId[] = [];
    for (let index = 0; index < count; index += 1) {
      const shift = (index - (count - 1) / 2) * 6;
      const center = {
        x: midpoint.x + direction.x * shift,
        y: midpoint.y + direction.y * shift,
      };
      if (marker.type === 'equal_length') {
        ids.push(
          segment(
            { x: center.x - perpendicular.x * 8, y: center.y - perpendicular.y * 8 },
            { x: center.x + perpendicular.x * 8, y: center.y + perpendicular.y * 8 },
          ),
        );
      } else {
        ids.push(
          segment(
            {
              x: center.x - direction.x * 6 + perpendicular.x * 5,
              y: center.y - direction.y * 6 + perpendicular.y * 5,
            },
            center,
          ),
          segment(center, {
            x: center.x + direction.x * 6 + perpendicular.x * 5,
            y: center.y + direction.y * 6 + perpendicular.y * 5,
          }),
        );
      }
    }
    return ids;
  }

  const [a, vertex, c] = marker.points.map((id) => byId.get(id));
  if (!a || !vertex || !c) return [];
  const arc = getInteriorAngleArc(vertex, a, c, marker.group);
  const ids: DrShapeId[] = [];
  for (let index = 1; index < arc.points.length; index += 1) {
    ids.push(segment(arc.points[index - 1], arc.points[index]));
  }
  return ids;
}

export function getGeometryScene(intent: GeometryIntent): GeometryScene | null {
  const result = solveGeometry(intent.model, { debug: import.meta.env.DEV });
  if (import.meta.env.DEV && result.debug) {
    console.debug('[geometry-visualization]', result.debug);
  }
  if (result.status === 'unsatisfiable') return null;
  return normalizeGeometryScene(result.scene, {
    targetWidth: GEOMETRY_TARGET_SIZE.width,
    targetHeight: GEOMETRY_TARGET_SIZE.height,
    padding: GEOMETRY_TARGET_SIZE.padding,
  });
}

export function renderGeometryIntent(
  intent: GeometryIntent,
  context: VisualizationRenderContext,
): VisualizationRenderResult {
  const scene = getGeometryScene(intent);
  if (!scene) return { createdShapeIds: [] };
  const createdShapeIds: DrShapeId[] = [];
  const byId = new Map(scene.points.map((point) => [point.id, point]));

  for (const circle of scene.circles) {
    const center = byId.get(circle.center);
    if (!center) continue;
    createdShapeIds.push(
      createBoardCircle(
        context.editor,
        context,
        context.origin.x + center.x - circle.radius,
        context.origin.y + center.y - circle.radius,
        circle.radius * 2,
      ),
    );
  }
  for (const line of scene.segments) {
    const from = byId.get(line.from);
    const to = byId.get(line.to);
    if (!from || !to) continue;
    const createLine = line.kind === 'ray' ? createBoardArrow : createBoardSegment;
    const direction = unit(from, to);
    const extra = line.kind === 'line' ? 28 : 0;
    createdShapeIds.push(
      createLine(
        context.editor,
        context,
        context.origin.x,
        context.origin.y,
        { x: from.x - direction.x * extra, y: from.y - direction.y * extra },
        { x: to.x + direction.x * extra, y: to.y + direction.y * extra },
      ),
    );
  }
  for (const marker of scene.markers) {
    createdShapeIds.push(...renderMarker(scene, marker, context));
  }
  for (const point of scene.points) {
    if (!point.label && scene.circles.some((circle) => circle.center === point.id)) continue;
    createdShapeIds.push(
      createBoardEllipse(
        context.editor,
        context,
        context.origin.x + point.x - 4,
        context.origin.y + point.y - 4,
        8,
      ),
    );
  }
  for (const label of scene.labels) {
    const point = byId.get(label.point);
    if (!point) continue;
    const isCompact = label.kind === 'angle' || label.kind === 'measure';
    createdShapeIds.push(
      createBoardText(
        context.editor,
        context,
        context.origin.x + point.x + label.offset.x,
        context.origin.y + point.y + label.offset.y,
        label.text,
        isCompact ? 96 : 48,
        isCompact ? 's' : undefined,
      ),
    );
  }

  return { createdShapeIds };
}
