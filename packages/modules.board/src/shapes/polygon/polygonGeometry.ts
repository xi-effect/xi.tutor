export type Pt = { x: number; y: number };

export const MIN_VERTEX_GAP = 1;

export function distance(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function add(a: Pt, b: Pt): Pt {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Pt, b: Pt): Pt {
  return { x: a.x - b.x, y: a.y - b.y };
}

function dot(a: Pt, b: Pt) {
  return a.x * b.x + a.y * b.y;
}

function cross(a: Pt, b: Pt) {
  return a.x * b.y - a.y * b.x;
}

export function triangleArea(a: Pt, b: Pt, c: Pt) {
  return Math.abs(cross(sub(b, a), sub(c, a))) / 2;
}

export function isValidTriangle(points: Pt[], minGap = MIN_VERTEX_GAP) {
  if (points.length !== 3) return false;
  const [a, b, c] = points;
  if (!a || !b || !c) return false;
  if (distance(a, b) < minGap || distance(b, c) < minGap || distance(a, c) < minGap) return false;
  return triangleArea(a, b, c) > minGap;
}

export function projectOntoLine(origin: Pt, direction: Pt, target: Pt): Pt | null {
  const lengthSquared = dot(direction, direction);
  if (lengthSquared < 1e-8) return null;
  const parameter = dot(sub(target, origin), direction) / lengthSquared;
  return add(origin, { x: direction.x * parameter, y: direction.y * parameter });
}

export function segmentsProperlyIntersect(a: Pt, b: Pt, c: Pt, d: Pt) {
  const ab = sub(b, a);
  const cd = sub(d, c);
  const d1 = cross(ab, sub(c, a));
  const d2 = cross(ab, sub(d, a));
  const d3 = cross(cd, sub(a, c));
  const d4 = cross(cd, sub(b, c));
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function basesAreParallel(a: Pt, b: Pt, c: Pt, d: Pt) {
  const ab = sub(b, a);
  const cd = sub(d, c);
  const scale = Math.hypot(ab.x, ab.y) * Math.hypot(cd.x, cd.y);
  if (scale < 1e-8) return false;
  return Math.abs(cross(ab, cd)) / scale < 0.02;
}

export function isValidTrapezoid(points: Pt[], minGap = MIN_VERTEX_GAP) {
  if (points.length !== 4) return false;
  const [a, b, c, d] = points;
  if (!a || !b || !c || !d) return false;
  if (
    [distance(a, b), distance(b, c), distance(c, d), distance(d, a)].some((gap) => gap < minGap)
  ) {
    return false;
  }
  if (!basesAreParallel(a, b, c, d)) return false;
  const baseLength = Math.hypot(b.x - a.x, b.y - a.y);
  const height = Math.abs(cross(sub(b, a), sub(c, a))) / baseLength;
  if (height < minGap) return false;
  if (segmentsProperlyIntersect(a, d, b, c)) return false;
  return true;
}

export function moveTriangleVertex(points: Pt[], index: number, next: Pt, minGap = MIN_VERTEX_GAP) {
  if (points.length !== 3 || index < 0 || index > 2) return null;
  const result = points.map((point, pointIndex) => (pointIndex === index ? next : point));
  return isValidTriangle(result, minGap) ? result : null;
}

/** Сохраняет параллельность оснований AB и CD. Невалидное положение отклоняется. */
export function moveTrapezoidVertex(
  points: Pt[],
  index: number,
  next: Pt,
  minGap = MIN_VERTEX_GAP,
): Pt[] | null {
  if (points.length !== 4) return null;
  const [a, b, c, d] = points;
  if (!a || !b || !c || !d) return null;

  let result: Pt[] | null = null;

  if (index === 3) {
    const snapped = projectOntoLine(c, sub(b, a), next);
    if (!snapped) return null;
    result = [a, b, c, snapped];
  } else if (index === 2) {
    const delta = sub(next, c);
    result = [a, b, next, add(d, delta)];
  } else if (index === 0 || index === 1) {
    const nextA = index === 0 ? next : a;
    const nextB = index === 1 ? next : b;
    const oldBase = sub(b, a);
    const oldLengthSquared = dot(oldBase, oldBase);
    if (oldLengthSquared < 1e-8) return null;
    const parameter = dot(sub(d, c), oldBase) / oldLengthSquared;
    const nextBase = sub(nextB, nextA);
    if (dot(nextBase, nextBase) < 1e-8) return null;
    result = [nextA, nextB, c, add(c, { x: nextBase.x * parameter, y: nextBase.y * parameter })];
  }

  if (!result || !isValidTrapezoid(result, minGap)) return null;
  return result;
}

export function guideThrough(origin: Pt, direction: Pt, span = 4000) {
  const length = Math.hypot(direction.x, direction.y);
  if (length < 1e-6) return null;
  const unitX = direction.x / length;
  const unitY = direction.y / length;
  return {
    a: { x: origin.x - unitX * span, y: origin.y - unitY * span },
    b: { x: origin.x + unitX * span, y: origin.y + unitY * span },
  };
}

/** Сдвигает локальные вершины так, чтобы ограничивающий прямоугольник начинался в (0, 0). */
export function normalizeVertices(origin: Pt, rotation: number, vertices: Pt[]) {
  let minX = Infinity;
  let minY = Infinity;
  for (const vertex of vertices) {
    minX = Math.min(minX, vertex.x);
    minY = Math.min(minY, vertex.y);
  }

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  return {
    x: origin.x + minX * cos - minY * sin,
    y: origin.y + minX * sin + minY * cos,
    vertices: vertices.map((vertex) => ({ x: vertex.x - minX, y: vertex.y - minY })),
  };
}
