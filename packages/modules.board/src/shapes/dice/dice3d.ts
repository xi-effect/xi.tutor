import { easeOutCubic } from '../../dice/diceMotion';
import type { DiceSides } from '../../dice/diceRoll';

/**
 * Камера доски — это CSS-transform, он схлопывает preserve-3d.
 * Кубик считается в пространстве и рисуется проекцией, поэтому объём остаётся на холсте.
 */

export type Vec3 = [number, number, number];
type Quat = [number, number, number, number];

type ModelFace = {
  indices: number[];
  value: number;
  normal: Vec3;
  /** В модельном пространстве: после rest-поворота смотрит вверх экрана, цифра читается как текст. */
  up: Vec3;
  centroid: Vec3;
  extent: number;
  rest: Quat;
};

type DieModel = {
  vertices: Vec3[];
  faces: ModelFace[];
};

export type PaintedMark = { x: number; y: number; r: number };
export type PaintedLabel = { x: number; y: number; rotate: number; size: number; text: string };
export type PaintedFace = {
  value: number;
  points: string;
  circle?: { cx: number; cy: number; r: number };
  shade: number;
  stroke: boolean;
  /** 1 во время броска. К концу боковые грани той же фигуры растворяются, остаётся верхняя. */
  opacity: number;
  label: PaintedLabel | null;
  pips: PaintedMark[];
};

const FOCAL = 3.5;
const models = new Map<DiceSides, DieModel>();

const PIP_LAYOUT: Record<number, Array<[number, number]>> = {
  1: [[0, 0]],
  2: [
    [-0.46, 0.46],
    [0.46, -0.46],
  ],
  3: [
    [-0.46, 0.46],
    [0, 0],
    [0.46, -0.46],
  ],
  4: [
    [-0.46, 0.46],
    [0.46, 0.46],
    [-0.46, -0.46],
    [0.46, -0.46],
  ],
  5: [
    [-0.46, 0.46],
    [0.46, 0.46],
    [0, 0],
    [-0.46, -0.46],
    [0.46, -0.46],
  ],
  6: [
    [-0.46, 0.5],
    [0.46, 0.5],
    [-0.46, 0],
    [0.46, 0],
    [-0.46, -0.5],
    [0.46, -0.5],
  ],
};

export function dieModel(sides: DiceSides): DieModel {
  const cached = models.get(sides);
  if (cached) return cached;
  const model = buildModel(sides);
  models.set(sides, model);
  return model;
}

export function dieOrientation(
  sides: DiceSides,
  value: number,
  seed: number,
  progress: number,
): Quat {
  const model = dieModel(sides);
  const face = model.faces.find((item) => item.value === value) ?? model.faces[0];
  const rest = face.rest;
  const eased = easeOutCubic(progress);
  const dirY = (seed & 2) === 0 ? 1 : -1;
  const dirZ = (seed & 4) === 0 ? 1 : -1;
  const axis = normalize([0.42 * dirZ, dirY, 0.28 * dirY]);
  const turns = 2 + (seed % 2);
  const phase = 0.9 + (seed % 5) * 0.22;
  const angle = (1 - eased) * (turns * Math.PI * 2 + phase);
  return quatMul(quatFromAxisAngle(axis, angle), rest);
}

export function frontFaceValue(
  sides: DiceSides,
  value: number,
  seed: number,
  progress: number,
): number {
  const model = dieModel(sides);
  const rotation = dieOrientation(sides, value, seed, progress);
  let best = -Infinity;
  let facing = model.faces[0]?.value ?? value;

  for (const face of model.faces) {
    if (face.value <= 0) continue;
    const normal = quatRotate(rotation, face.normal);
    if (normal[2] > best) {
      best = normal[2];
      facing = face.value;
    }
  }

  return facing;
}

export function projectDie(
  sides: DiceSides,
  value: number,
  seed: number,
  progress: number,
  size: number,
): PaintedFace[] {
  return tumblingSolid(sides, value, seed, progress, size);
}

/**
 * Одна и та же модель и в полёте, и после остановки.
 * В конце выпавшая грань просто становится параллельна экрану, без подмены фигуры.
 */
function tumblingSolid(
  sides: DiceSides,
  value: number,
  seed: number,
  progress: number,
  size: number,
): PaintedFace[] {
  const model = dieModel(sides);
  const rotation = dieOrientation(sides, value, seed, progress);
  const fit = size * 0.4;
  const settle = progress <= 0.72 ? 0 : Math.min(1, (progress - 0.72) / 0.28);
  const focal = 2.35 + settle * 48;
  const painted: Array<PaintedFace & { depth: number }> = [];

  for (const face of model.faces) {
    if (face.value < 0) continue;

    const normal = quatRotate(rotation, face.normal);
    if (normal[2] <= 0.02) continue;

    const up = quatRotate(rotation, face.up);
    const right = normalize(cross(up, normal));
    const centroid = quatRotate(rotation, face.centroid);
    const corners = face.indices.map((index) =>
      project(quatRotate(rotation, model.vertices[index]), fit, size, focal),
    );
    if (polygonArea(corners) < size * 0.9) continue;
    const depth =
      corners.reduce((sum, _, index) => {
        return sum + quatRotate(rotation, model.vertices[face.indices[index]])[2];
      }, 0) / corners.length;
    const light = Math.max(0, normal[0] * 0.15 + normal[1] * 0.55 + normal[2] * 0.85);
    const center = project(centroid, fit, size, focal);
    const upTip = project(add(centroid, scale(up, face.extent * 0.55)), fit, size, focal);
    const rawRotate = (Math.atan2(upTip[0] - center[0], -(upTip[1] - center[1])) * 180) / Math.PI;
    const level = normal[2] > 0.75 ? settle : 0;
    const rotate = rawRotate * (1 - level);
    const showMark = normal[2] > 0.18;
    const room = inscribedRadius(corners, center);
    const digits = String(face.value).length;
    const markSize = Math.max(6, Math.min(room * (digits > 1 ? 0.7 : 1.05), size * 0.2));
    const opacity = normal[2] > 0.8 ? 1 : 1 - settle;
    if (opacity <= 0.02) continue;

    painted.push({
      value: face.value,
      points: joinPoints(corners),
      shade: 0.55 * (1 - light),
      stroke: true,
      opacity,
      depth,
      label:
        showMark && sides !== 6 && face.value > 0
          ? { x: center[0], y: center[1], rotate, size: markSize, text: String(face.value) }
          : null,
      pips:
        showMark && sides === 6 && face.value > 0
          ? (PIP_LAYOUT[face.value] ?? []).map(([px, py]) => {
              const point = project(
                add(
                  add(centroid, scale(right, px * face.extent * 0.8)),
                  scale(up, py * face.extent * 0.8),
                ),
                fit,
                size,
                focal,
              );
              return { x: point[0], y: point[1], r: Math.max(1.5, markSize * 0.22) };
            })
          : [],
    });
  }

  painted.sort((a, b) => a.depth - b.depth);
  return painted;
}

function inscribedRadius(points: Array<[number, number]>, center: [number, number]) {
  let nearest = Infinity;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const dx = next[0] - current[0];
    const dy = next[1] - current[1];
    const length = Math.hypot(dx, dy) || 1;
    const distance =
      Math.abs((center[0] - current[0]) * dy - (center[1] - current[1]) * dx) / length;
    nearest = Math.min(nearest, distance);
  }

  return Number.isFinite(nearest) ? nearest : 0;
}

function polygonArea(points: Array<[number, number]>) {
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    sum += current[0] * next[1] - next[0] * current[1];
  }
  return Math.abs(sum) / 2;
}

function joinPoints(points: Array<[number, number]>) {
  return points.map((point) => `${point[0].toFixed(2)},${point[1].toFixed(2)}`).join(' ');
}

function buildModel(sides: DiceSides): DieModel {
  if (sides === 2) return finish(coin());
  if (sides === 6) return finish(cube());
  if (sides === 4) return finish(hull(tetrahedron(), 3));
  if (sides === 8) return finish(hull(octahedron(), 3));
  if (sides === 10) return finish(hull(pentagonalBipyramid(), 3));
  if (sides === 12) return finish(hull(dodecahedron(), 5));
  return finish(hull(icosahedron(), 3));
}

function finish(raw: {
  vertices: Vec3[];
  faces: Array<{ indices: number[]; value: number }>;
}): DieModel {
  const vertices = raw.vertices.map((vertex) => normalize(vertex));
  const numbered = assignValues(raw.faces);
  return {
    vertices,
    faces: numbered.map((face) => {
      const frame = faceFrame(vertices, face.indices);
      const rest = readableRest(vertices, face.indices, frame.normal);
      const up = normalize(quatRotate(quatConjugate(rest), [0, 1, 0]));
      return { ...face, ...frame, up, rest };
    }),
  };
}

function assignValues(faces: Array<{ indices: number[]; value: number }>) {
  if (faces.some((face) => face.value > 0)) return faces;
  faces.forEach((face, index) => {
    face.value = index + 1;
  });
  return faces;
}

function cube() {
  const vertices: Vec3[] = [];
  for (const x of [-1, 1]) {
    for (const y of [-1, 1]) {
      for (const z of [-1, 1]) vertices.push([x, y, z]);
    }
  }
  return { vertices, faces: hull(vertices, 4).faces };
}

function tetrahedron(): Vec3[] {
  return [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ];
}

function octahedron(): Vec3[] {
  return [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
}

function pentagonalBipyramid(): Vec3[] {
  const vertices: Vec3[] = [
    [0, 1.15, 0],
    [0, -1.15, 0],
  ];
  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * Math.PI * 2;
    vertices.push([Math.cos(angle), 0, Math.sin(angle)]);
  }
  return vertices;
}

function icosahedron(): Vec3[] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices: Vec3[] = [];
  for (const [x, y, z] of [
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
  ] as Vec3[]) {
    vertices.push([x, y, z]);
  }
  return vertices;
}

function dodecahedron(): Vec3[] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const inv = 1 / phi;
  const vertices: Vec3[] = [];
  for (const x of [-1, 1]) {
    for (const y of [-1, 1]) {
      for (const z of [-1, 1]) vertices.push([x, y, z]);
    }
  }
  return vertices.concat([
    [0, inv, phi],
    [0, inv, -phi],
    [0, -inv, phi],
    [0, -inv, -phi],
    [phi, 0, inv],
    [phi, 0, -inv],
    [-phi, 0, inv],
    [-phi, 0, -inv],
    [inv, phi, 0],
    [-inv, phi, 0],
    [inv, -phi, 0],
    [-inv, -phi, 0],
  ]);
}

function coplanar(indices: number[], vertices: Vec3[]) {
  const normal = polygonNormal(indices, vertices);
  const origin = vertices[indices[0]];
  return indices.every((index) => Math.abs(dot(sub(vertices[index], origin), normal)) < 1e-3);
}

function coin() {
  const steps = 48;
  const radius = 1;
  const half = 0.18;
  const vertices: Vec3[] = [];
  for (const z of [half, -half]) {
    for (let index = 0; index < steps; index += 1) {
      const angle = (index / steps) * Math.PI * 2;
      vertices.push([Math.cos(angle) * radius, Math.sin(angle) * radius, z]);
    }
  }

  const top = Array.from({ length: steps }, (_, index) => index);
  const bottom = Array.from({ length: steps }, (_, index) => steps + (steps - 1 - index));
  const faces = [
    { indices: top, value: 1 },
    { indices: bottom, value: 2 },
  ];

  for (let index = 0; index < steps; index += 1) {
    const next = (index + 1) % steps;
    faces.push({ indices: [index, next, steps + next, steps + index], value: 0 });
  }

  return { vertices, faces };
}

function hull(vertices: Vec3[], faceSize: number) {
  const edge = minDistance(vertices);
  const maxChord = edge * (faceSize === 3 ? 1.7 : 1.95);
  const faces: Array<{ indices: number[]; value: number }> = [];
  const seen = new Set<string>();

  const visit = (indices: number[]) => {
    if (
      indices.some((left, leftIndex) =>
        indices.some(
          (right, rightIndex) =>
            rightIndex > leftIndex && distance(vertices[left], vertices[right]) > maxChord,
        ),
      )
    ) {
      return;
    }
    if (!coplanar(indices, vertices)) return;

    const ordered = orderPolygon(indices, vertices);
    const normal = polygonNormal(ordered, vertices);
    const center = centroid(ordered.map((index) => vertices[index]));
    const outward = dot(normal, center) >= 0 ? normal : scale(normal, -1);
    const winding = dot(normal, center) >= 0 ? ordered : [...ordered].reverse();
    if (!isSupportingFace(winding, vertices, outward, center)) return;

    const key = [...winding].sort((a, b) => a - b).join(',');
    if (seen.has(key)) return;
    seen.add(key);
    faces.push({ indices: winding, value: 0 });
  };

  combinations(vertices.length, faceSize, visit);
  return { vertices, faces };
}

function isSupportingFace(indices: number[], vertices: Vec3[], normal: Vec3, center: Vec3) {
  const onFace = new Set(indices);
  for (let index = 0; index < vertices.length; index += 1) {
    if (onFace.has(index)) continue;
    if (dot(sub(vertices[index], center), normal) > 1e-3) return false;
  }
  return true;
}

function orderPolygon(indices: number[], vertices: Vec3[]) {
  const points = indices.map((index) => vertices[index]);
  const normal = polygonNormal(indices, vertices);
  const center = centroid(points);
  const tangent = normalize(cross(normal, Math.abs(normal[1]) < 0.85 ? [0, 1, 0] : [1, 0, 0]));
  const bitangent = cross(normal, tangent);

  return [...indices].sort((left, right) => {
    const a = sub(vertices[left], center);
    const b = sub(vertices[right], center);
    return (
      Math.atan2(dot(a, bitangent), dot(a, tangent)) -
      Math.atan2(dot(b, bitangent), dot(b, tangent))
    );
  });
}

function polygonNormal(indices: number[], vertices: Vec3[]) {
  const a = vertices[indices[0]];
  const b = vertices[indices[1]];
  const c = vertices[indices[2]];
  return normalize(cross(sub(b, a), sub(c, a)));
}

function combinations(count: number, size: number, visit: (indices: number[]) => void) {
  const picked: number[] = [];
  const walk = (start: number) => {
    if (picked.length === size) {
      visit([...picked]);
      return;
    }
    for (let index = start; index <= count - (size - picked.length); index += 1) {
      picked.push(index);
      walk(index + 1);
      picked.pop();
    }
  };
  walk(0);
}

function faceFrame(vertices: Vec3[], indices: number[]) {
  const points = indices.map((index) => vertices[index]);
  const center = centroid(points);
  let normal = polygonNormal(indices, vertices);
  if (dot(normal, center) < 0) normal = scale(normal, -1);
  normal = normalize(normal);

  let up = sub([0, 1, 0], scale(normal, normal[1]));
  if (length(up) < 1e-4) up = sub([1, 0, 0], scale(normal, normal[0]));
  up = normalize(up);

  const extent = points.reduce((sum, point) => sum + distance(point, center), 0) / points.length;
  return { normal, up, centroid: center, extent: extent * 0.72 };
}

function quatConjugate(q: Quat): Quat {
  return [-q[0], -q[1], -q[2], q[3]];
}

/** Грань к зрителю, нижнее ребро горизонтально, цифра читается слева направо. */
function readableRest(vertices: Vec3[], indices: number[], normal: Vec3): Quat {
  const align = quatFromTo(normal, [0, 0, 1]);
  const flat = indices.map((index) => quatRotate(align, vertices[index]));
  const modelCenter = centroid(indices.map((index) => vertices[index]));
  let bestTwist = 0;
  let bestDrop = -Infinity;

  for (let index = 0; index < flat.length; index += 1) {
    const current = flat[index];
    const next = flat[(index + 1) % flat.length];
    const angle = Math.atan2(next[1] - current[1], next[0] - current[0]);

    for (const twist of [-angle, -angle + Math.PI]) {
      const pose = quatMul(quatFromAxisAngle([0, 0, 1], twist), align);
      const turnedCenter = quatRotate(pose, modelCenter);
      const a = quatRotate(pose, vertices[indices[index]]);
      const b = quatRotate(pose, vertices[indices[(index + 1) % indices.length]]);
      const drop = (a[1] + b[1]) / 2 - turnedCenter[1];
      if (drop > bestDrop) {
        bestDrop = drop;
        bestTwist = twist;
      }
    }
  }

  return quatMul(quatFromAxisAngle([0, 0, 1], bestTwist), align);
}

function project(vertex: Vec3, fit: number, size: number, focal = FOCAL): [number, number] {
  const scaleFactor = focal / (focal - vertex[2]);
  return [size / 2 + vertex[0] * fit * scaleFactor, size / 2 - vertex[1] * fit * scaleFactor];
}

function quatFromTo(from: Vec3, to: Vec3): Quat {
  const a = normalize(from);
  const b = normalize(to);
  const cosine = dot(a, b);
  if (cosine > 0.999999) return [0, 0, 0, 1];
  if (cosine < -0.999999) {
    const axis = Math.abs(a[0]) < 0.9 ? cross(a, [1, 0, 0]) : cross(a, [0, 1, 0]);
    return quatFromAxisAngle(normalize(axis), Math.PI);
  }
  return quatNormalize([cross(a, b)[0], cross(a, b)[1], cross(a, b)[2], 1 + cosine]);
}

function quatFromAxisAngle(axis: Vec3, angle: number): Quat {
  const unit = normalize(axis);
  const half = angle / 2;
  const sine = Math.sin(half);
  return [unit[0] * sine, unit[1] * sine, unit[2] * sine, Math.cos(half)];
}

function quatMul(a: Quat, b: Quat): Quat {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}

function quatRotate(q: Quat, v: Vec3): Vec3 {
  const rotated = quatMul(quatMul(q, [v[0], v[1], v[2], 0]), [-q[0], -q[1], -q[2], q[3]]);
  return [rotated[0], rotated[1], rotated[2]];
}

function quatNormalize(q: Quat): Quat {
  const magnitude = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / magnitude, q[1] / magnitude, q[2] / magnitude, q[3] / magnitude];
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scale(v: Vec3, factor: number): Vec3 {
  return [v[0] * factor, v[1] * factor, v[2] * factor];
}

function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function length(v: Vec3) {
  return Math.hypot(v[0], v[1], v[2]);
}

function normalize(v: Vec3): Vec3 {
  const magnitude = length(v) || 1;
  return [v[0] / magnitude, v[1] / magnitude, v[2] / magnitude];
}

function distance(a: Vec3, b: Vec3) {
  return length(sub(a, b));
}

function minDistance(vertices: Vec3[]) {
  let best = Infinity;
  for (let left = 0; left < vertices.length; left += 1) {
    for (let right = left + 1; right < vertices.length; right += 1) {
      best = Math.min(best, distance(vertices[left], vertices[right]));
    }
  }
  return best;
}

function centroid(points: Vec3[]): Vec3 {
  const sum = points.reduce<Vec3>((acc, point) => add(acc, point), [0, 0, 0]);
  return scale(sum, 1 / points.length);
}
