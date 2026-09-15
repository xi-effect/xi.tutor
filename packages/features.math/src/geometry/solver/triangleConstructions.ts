import type { GeometrySemanticModel, GeometrySegment, TriangleEntity } from '../semantic/types';
import { ANGLE_EPSILON, evaluateGeometryScalar, GEOMETRY_EPSILON } from './math';
import type { PointCoordinates } from './sceneBuilder';

export function segmentKey([a, b]: GeometrySegment): string {
  return [a, b].sort().join('');
}

export function triangleLengthMap(model: GeometrySemanticModel): Map<string, number> {
  const result = new Map<string, number>();
  for (const constraint of model.constraints) {
    if (constraint.type !== 'length') continue;
    const value = evaluateGeometryScalar(constraint.value);
    if (value != null) result.set(segmentKey(constraint.segment), value);
  }
  return result;
}

export function triangleAngleMap(
  model: GeometrySemanticModel,
  triangle: TriangleEntity,
): Map<string, number> {
  const result = new Map<string, number>();
  for (const constraint of model.constraints) {
    if (constraint.type !== 'angle') continue;
    if (!constraint.points.every((point) => triangle.vertices.includes(point))) continue;
    if (constraint.value <= ANGLE_EPSILON || constraint.value >= 180 - ANGLE_EPSILON) continue;
    result.set(constraint.points[1], constraint.value);
  }
  return result;
}

function completeAngles(angles: Map<string, number>, vertices: [string, string, string]) {
  const [first, second, third] = vertices;
  const values = [angles.get(first), angles.get(second), angles.get(third)];
  const missing = values.filter((value) => value == null).length;
  if (missing !== 1) return;
  const remainder = 180 - ((values[0] ?? 0) + (values[1] ?? 0) + (values[2] ?? 0));
  if (remainder <= ANGLE_EPSILON || remainder >= 180 - ANGLE_EPSILON) return;
  if (values[0] == null) angles.set(first, remainder);
  else if (values[1] == null) angles.set(second, remainder);
  else angles.set(third, remainder);
}

function placeFromVertex(
  vertex: string,
  first: string,
  second: string,
  firstLeg: number,
  degrees: number,
  secondLeg: number,
): PointCoordinates {
  const radians = (degrees * Math.PI) / 180;
  return {
    [vertex]: { x: 0, y: 0 },
    [first]: { x: firstLeg, y: 0 },
    [second]: {
      x: Math.cos(radians) * secondLeg,
      y: Math.sin(radians) * secondLeg,
    },
  };
}

function constructSss(
  a: string,
  b: string,
  c: string,
  ab: number,
  bc: number,
  ca: number,
): PointCoordinates | null {
  const x = (ca ** 2 + ab ** 2 - bc ** 2) / (2 * ab);
  const ySquare = ca ** 2 - x ** 2;
  if (ySquare <= GEOMETRY_EPSILON) return null;
  return {
    [a]: { x: 0, y: 0 },
    [b]: { x: ab, y: 0 },
    [c]: { x, y: Math.sqrt(ySquare) },
  };
}

function lawOfSinesSides(
  triangle: TriangleEntity,
  angles: Map<string, number>,
  known: { opposite: string; length: number },
): { ab: number; bc: number; ca: number } | null {
  const oppositeAngle = angles.get(known.opposite);
  if (oppositeAngle == null) return null;
  const scale = known.length / Math.sin((oppositeAngle * Math.PI) / 180);
  const [a, b, c] = triangle.vertices;
  const angleA = angles.get(a);
  const angleB = angles.get(b);
  const angleC = angles.get(c);
  if (angleA == null || angleB == null || angleC == null) return null;
  return {
    bc: scale * Math.sin((angleA * Math.PI) / 180),
    ca: scale * Math.sin((angleB * Math.PI) / 180),
    ab: scale * Math.sin((angleC * Math.PI) / 180),
  };
}

export function constructTriangleCoordinates(
  triangle: TriangleEntity,
  model: GeometrySemanticModel,
): { coordinates: PointCoordinates; complete: boolean } | { unsatisfiable: string } {
  const [a, b, c] = triangle.vertices;
  const lengths = triangleLengthMap(model);
  const angles = triangleAngleMap(model, triangle);
  completeAngles(angles, triangle.vertices);

  const ab = lengths.get(segmentKey([a, b]));
  const bc = lengths.get(segmentKey([b, c]));
  const ca = lengths.get(segmentKey([c, a]));

  if (ab != null && bc != null && ca != null) {
    const coordinates = constructSss(a, b, c, ab, bc, ca);
    if (!coordinates) return { unsatisfiable: 'Невозможно построить треугольник' };
    return { coordinates, complete: true };
  }

  const fromVertex: Array<[string, string, string, number | undefined, number | undefined]> = [
    [a, b, c, ab, ca],
    [b, a, c, ab, bc],
    [c, a, b, ca, bc],
  ];
  for (const [vertex, first, second, firstLeg, secondLeg] of fromVertex) {
    const degrees = angles.get(vertex);
    if (degrees == null || firstLeg == null || secondLeg == null) continue;
    return {
      coordinates: placeFromVertex(vertex, first, second, firstLeg, degrees, secondLeg),
      complete: true,
    };
  }

  if (angles.size === 3) {
    const known =
      ab != null
        ? { opposite: c, length: ab }
        : bc != null
          ? { opposite: a, length: bc }
          : ca != null
            ? { opposite: b, length: ca }
            : { opposite: c, length: 2 };
    const sides = lawOfSinesSides(triangle, angles, known);
    if (sides) {
      const coordinates = constructSss(a, b, c, sides.ab, sides.bc, sides.ca);
      if (!coordinates) return { unsatisfiable: 'Невозможно построить треугольник' };
      return { coordinates, complete: ab != null || bc != null || ca != null };
    }
  }

  for (const [vertex, first, second, firstLeg, secondLeg] of fromVertex) {
    const degrees = angles.get(vertex);
    if (degrees == null) continue;
    return {
      coordinates: placeFromVertex(
        vertex,
        first,
        second,
        firstLeg ?? 1.6,
        degrees,
        secondLeg ?? 1.4,
      ),
      complete: false,
    };
  }

  return {
    coordinates: {
      [a]: { x: 0, y: 0 },
      [b]: { x: 2, y: 0 },
      [c]: { x: 0.7, y: 1.45 },
    },
    complete: false,
  };
}
