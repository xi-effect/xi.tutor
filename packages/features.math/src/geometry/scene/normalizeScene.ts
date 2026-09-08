import type { GeometryScene, SceneBounds, SceneLabel } from './types';
import { getInteriorAngleArc } from './angleMark';

export type NormalizeGeometrySceneOptions = {
  targetWidth: number;
  targetHeight: number;
  padding: number;
};

const MIN_FIGURE_SIDE = 220;
const POINT_LABEL_DISTANCE = 40;
const CLUSTER_GAP = 56;

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
  const width = maxX - minX;
  const height = maxY - minY;
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: width > 1e-6 ? width : 1,
    height: height > 1e-6 ? height : 1,
  };
}

function centroid(points: GeometryScene['points']) {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / Math.max(points.length, 1),
    y: points.reduce((sum, point) => sum + point.y, 0) / Math.max(points.length, 1),
  };
}

function automaticLabels(points: GeometryScene['points']): SceneLabel[] {
  const center = centroid(points);
  const labeled = points.filter((point) => point.label);
  return labeled.map((point) => {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const length = Math.hypot(dx, dy);
    let offset =
      length < 1
        ? { x: 16, y: -38 }
        : {
            x: (dx / length) * POINT_LABEL_DISTANCE - 6,
            y: (dy / length) * POINT_LABEL_DISTANCE - 12,
          };
    for (const other of labeled) {
      if (other.id === point.id) continue;
      const sep = Math.hypot(other.x - point.x, other.y - point.y);
      if (sep >= CLUSTER_GAP || sep < 1e-6) continue;
      const extra = ((CLUSTER_GAP - sep) / CLUSTER_GAP) * 26;
      offset = {
        x: offset.x + ((point.x - other.x) / sep) * extra,
        y: offset.y + ((point.y - other.y) / sep) * extra,
      };
    }
    return {
      id: `label-${point.id}`,
      point: point.id,
      text: point.label!,
      kind: 'point' as const,
      offset,
    };
  });
}

function measurementLabels(
  scene: GeometryScene,
  points: GeometryScene['points'],
): SceneLabel[] {
  const byId = new Map(points.map((point) => [point.id, point]));
  const center = centroid(points);
  return (scene.measurementLabels ?? []).flatMap((label) => {
    const from = byId.get(label.segment[0]);
    const to = byId.get(label.segment[1]);
    if (!from || !to) return [];
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.max(Math.hypot(dx, dy), 1);
    let perp = { x: -dy / length, y: dx / length };
    const outward = (mid.x - center.x) * perp.x + (mid.y - center.y) * perp.y;
    if (outward < 0) perp = { x: -perp.x, y: -perp.y };
    return [
      {
        id: label.id,
        point: from.id,
        text: label.text,
        kind: 'measure' as const,
        offset: {
          x: mid.x - from.x + perp.x * 22,
          y: mid.y - from.y + perp.y * 22 - 8,
        },
      },
    ];
  });
}

function estimateLabelSize(label: Pick<SceneLabel, 'text' | 'kind'>): { width: number; height: number } {
  if (label.kind === 'angle') {
    return { width: Math.max(36, label.text.length * 9), height: 18 };
  }
  if (label.kind === 'measure') {
    return { width: Math.max(28, label.text.length * 9), height: 18 };
  }
  return { width: Math.max(16, label.text.length * 12), height: 22 };
}

function angleValueLabels(scene: GeometryScene, points: GeometryScene['points']): SceneLabel[] {
  const byId = new Map(points.map((point) => [point.id, point]));
  return (scene.angleLabels ?? []).flatMap((label) => {
    const [first, vertex, third] = label.points.map((id) => byId.get(id));
    if (!first || !vertex || !third) return [];
    const arc = getInteriorAngleArc(vertex, first, third, label.group ?? 1);
    const along =
      arc.radius + (arc.theta < 0.35 ? 34 : arc.theta < Math.PI / 3 ? 22 : 14);
    const size = estimateLabelSize({ text: label.text, kind: 'angle' });
    return [
      {
        id: label.id,
        point: vertex.id,
        text: label.text,
        kind: 'angle' as const,
        offset: {
          x: arc.bisector.x * along - size.width / 2,
          y: arc.bisector.y * along - size.height / 2,
        },
      },
    ];
  });
}

function labelCenter(label: SceneLabel, origin: { x: number; y: number }) {
  const size = estimateLabelSize(label);
  return {
    x: origin.x + label.offset.x + size.width / 2,
    y: origin.y + label.offset.y + size.height / 2,
    size,
  };
}

function separateLabels(labels: SceneLabel[], points: GeometryScene['points']): SceneLabel[] {
  const byId = new Map(points.map((point) => [point.id, point]));
  const resolved = labels.map((label) => ({ ...label, offset: { ...label.offset } }));
  for (let pass = 0; pass < 10; pass += 1) {
    for (let i = 0; i < resolved.length; i += 1) {
      const leftPoint = byId.get(resolved[i].point);
      if (!leftPoint) continue;
      const left = labelCenter(resolved[i], leftPoint);
      for (let j = i + 1; j < resolved.length; j += 1) {
        const rightPoint = byId.get(resolved[j].point);
        if (!rightPoint) continue;
        const right = labelCenter(resolved[j], rightPoint);
        const dx = right.x - left.x;
        const dy = right.y - left.y;
        const distance = Math.hypot(dx, dy);
        const minDistance =
          (left.size.width + right.size.width) / 2 +
          (resolved[i].kind === 'angle' || resolved[j].kind === 'angle' ? 16 : 14);
        if (distance >= minDistance || distance < 1e-6) continue;
        const push = (minDistance - distance) / 2;
        const ux = dx / distance;
        const uy = dy / distance;
        resolved[i].offset.x -= ux * push;
        resolved[i].offset.y -= uy * push;
        resolved[j].offset.x += ux * push;
        resolved[j].offset.y += uy * push;
      }
      for (const other of points) {
        if (other.id === resolved[i].point) continue;
        const after = labelCenter(resolved[i], leftPoint);
        const dx = after.x - other.x;
        const dy = after.y - other.y;
        const distance = Math.hypot(dx, dy);
        const clearance = Math.hypot(after.size.width, after.size.height) / 2 + 18;
        if (distance >= clearance || distance < 1e-6) continue;
        const push = clearance - distance;
        resolved[i].offset.x += (dx / distance) * push;
        resolved[i].offset.y += (dy / distance) * push;
      }
    }
  }
  return resolved;
}

function sceneExtent(
  points: GeometryScene['points'],
  circles: GeometryScene['circles'],
  labels: SceneLabel[],
) {
  const geometryBounds = getGeometrySceneBounds(points, circles);
  const byId = new Map(points.map((point) => [point.id, point]));
  const labelXs = labels.flatMap((label) => {
    const point = byId.get(label.point);
    if (!point) return [];
    const size = estimateLabelSize(label);
    const x = point.x + label.offset.x;
    return [x, x + size.width];
  });
  const labelYs = labels.flatMap((label) => {
    const point = byId.get(label.point);
    if (!point) return [];
    const size = estimateLabelSize(label);
    const y = point.y + label.offset.y;
    return [y, y + size.height];
  });
  const minX = Math.min(geometryBounds.minX, ...labelXs);
  const maxX = Math.max(geometryBounds.maxX, ...labelXs);
  const minY = Math.min(geometryBounds.minY, ...labelYs);
  const maxY = Math.max(geometryBounds.maxY, ...labelYs);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function fitScale(
  source: SceneBounds,
  options: NormalizeGeometrySceneOptions,
): { scale: number; offsetX: number; offsetY: number } {
  const contentWidth = Math.max(1, options.targetWidth - options.padding * 2);
  const contentHeight = Math.max(1, options.targetHeight - options.padding * 2);
  const uniform = Math.min(contentWidth / source.width, contentHeight / source.height);
  const scale = Math.max(uniform, MIN_FIGURE_SIDE / Math.min(source.width, source.height));
  const usedWidth = source.width * scale;
  const usedHeight = source.height * scale;
  const extraX = Math.max(0, contentWidth - usedWidth);
  const extraY = Math.max(0, contentHeight - usedHeight);
  return {
    scale,
    offsetX: options.padding + extraX / 2 - source.minX * scale,
    offsetY: options.padding + extraY / 2 - source.minY * scale,
  };
}

export function normalizeGeometryScene(
  scene: GeometryScene,
  options: NormalizeGeometrySceneOptions,
): GeometryScene {
  const source = getGeometrySceneBounds(scene.points, scene.circles);
  const { scale, offsetX, offsetY } = fitScale(source, options);
  let points = scene.points.map((point) => ({
    ...point,
    x: point.x * scale + offsetX,
    y: point.y * scale + offsetY,
  }));
  let circles = scene.circles.map((circle) => ({ ...circle, radius: circle.radius * scale }));
  const labels = separateLabels(
    [
      ...automaticLabels(points),
      ...measurementLabels(scene, points),
      ...angleValueLabels(scene, points),
    ],
    points,
  );
  let bounds = sceneExtent(points, circles, labels);
  const shiftX = options.padding - bounds.minX;
  const shiftY = options.padding - bounds.minY;
  if (Math.abs(shiftX) > 1e-6 || Math.abs(shiftY) > 1e-6) {
    points = points.map((point) => ({ ...point, x: point.x + shiftX, y: point.y + shiftY }));
    bounds = {
      minX: bounds.minX + shiftX,
      minY: bounds.minY + shiftY,
      maxX: bounds.maxX + shiftX,
      maxY: bounds.maxY + shiftY,
      width: bounds.width,
      height: bounds.height,
    };
  }
  return {
    ...scene,
    points,
    circles,
    labels,
    bounds,
  };
}
