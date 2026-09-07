import type { GeometryScene, SceneBounds, SceneLabel } from './types';

export type NormalizeGeometrySceneOptions = {
  targetWidth: number;
  targetHeight: number;
  padding: number;
};

export function getGeometrySceneBounds(
  points: GeometryScene['points'],
  circles: GeometryScene['circles'] = [],
): SceneBounds {
  const byId = new Map(points.map((point) => [point.id, point]));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  for (const circle of circles) {
    const center = byId.get(circle.center);
    if (!center) continue;
    xs.push(center.x - circle.radius, center.x + circle.radius);
    ys.push(center.y - circle.radius, center.y + circle.radius);
  }
  const minX = xs.length ? Math.min(...xs) : 0;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxX = xs.length ? Math.max(...xs) : 1;
  const maxY = ys.length ? Math.max(...ys) : 1;
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

function automaticLabels(points: GeometryScene['points']): SceneLabel[] {
  const center = {
    x: points.reduce((sum, point) => sum + point.x, 0) / Math.max(points.length, 1),
    y: points.reduce((sum, point) => sum + point.y, 0) / Math.max(points.length, 1),
  };
  return points
    .filter((point) => point.label)
    .map((point) => {
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      const length = Math.hypot(dx, dy);
      return {
        id: `label-${point.id}`,
        point: point.id,
        text: point.label!,
        offset:
          length < 1
            ? { x: 12, y: -28 }
            : { x: (dx / length) * 26 - 8, y: (dy / length) * 26 - 12 },
      };
    });
}

export function normalizeGeometryScene(
  scene: GeometryScene,
  options: NormalizeGeometrySceneOptions,
): GeometryScene {
  const source = getGeometrySceneBounds(scene.points, scene.circles);
  const contentWidth = Math.max(1, options.targetWidth - options.padding * 2);
  const contentHeight = Math.max(1, options.targetHeight - options.padding * 2);
  const scale = Math.min(contentWidth / source.width, contentHeight / source.height);
  const usedWidth = source.width * scale;
  const usedHeight = source.height * scale;
  const offsetX = options.padding + (contentWidth - usedWidth) / 2 - source.minX * scale;
  const offsetY = options.padding + (contentHeight - usedHeight) / 2 - source.minY * scale;
  const points = scene.points.map((point) => ({
    ...point,
    x: point.x * scale + offsetX,
    y: point.y * scale + offsetY,
  }));
  const circles = scene.circles.map((circle) => ({ ...circle, radius: circle.radius * scale }));
  const labels = automaticLabels(points);
  const geometryBounds = getGeometrySceneBounds(points, circles);
  const byId = new Map(points.map((point) => [point.id, point]));
  const labelXs = labels.flatMap((label) => {
    const point = byId.get(label.point);
    if (!point) return [];
    const x = point.x + label.offset.x;
    return [x, x + Math.max(12, label.text.length * 10)];
  });
  const labelYs = labels.flatMap((label) => {
    const point = byId.get(label.point);
    if (!point) return [];
    const y = point.y + label.offset.y;
    return [y, y + 20];
  });
  const minX = Math.min(geometryBounds.minX, ...labelXs);
  const maxX = Math.max(geometryBounds.maxX, ...labelXs);
  const minY = Math.min(geometryBounds.minY, ...labelYs);
  const maxY = Math.max(geometryBounds.maxY, ...labelYs);
  const bounds = { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  return {
    ...scene,
    points,
    circles,
    labels,
    bounds,
  };
}
