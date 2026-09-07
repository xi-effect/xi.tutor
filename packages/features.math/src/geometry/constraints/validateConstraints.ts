import { ANGLE_EPSILON, evaluateGeometryScalar, GEOMETRY_EPSILON } from '../solver/math';
import type { GeometrySemanticModel, GeometrySegment } from '../semantic/types';

function segmentKey([a, b]: GeometrySegment): string {
  return [a, b].sort().join('');
}

export type GeometryValidationResult = { valid: true } | { valid: false; reason: string };

export function validateGeometryConstraints(
  model: GeometrySemanticModel,
): GeometryValidationResult {
  const lengths = new Map<string, number>();
  for (const constraint of model.constraints) {
    if (
      constraint.type === 'angle' &&
      (constraint.value <= GEOMETRY_EPSILON || constraint.value >= 180 - GEOMETRY_EPSILON)
    ) {
      return { valid: false, reason: 'Некорректное значение угла' };
    }
    if (constraint.type !== 'length') continue;
    const value = evaluateGeometryScalar(constraint.value);
    if (value == null) return { valid: false, reason: 'Некорректное значение длины' };
    const key = segmentKey(constraint.segment);
    const previous = lengths.get(key);
    if (previous != null && Math.abs(previous - value) > GEOMETRY_EPSILON) {
      return { valid: false, reason: `Для ${key} заданы противоречивые длины` };
    }
    lengths.set(key, value);
  }

  for (const entity of model.entities) {
    if (entity.type !== 'triangle') continue;
    const [a, b, c] = entity.vertices;
    const sides = [
      lengths.get(segmentKey([a, b])),
      lengths.get(segmentKey([b, c])),
      lengths.get(segmentKey([c, a])),
    ];
    if (sides.every((side): side is number => side != null)) {
      const [ab, bc, ca] = sides;
      if (ab + bc <= ca || bc + ca <= ab || ca + ab <= bc) {
        return { valid: false, reason: `Длины сторон треугольника ${a}${b}${c} несовместимы` };
      }
      for (const constraint of model.constraints) {
        if (
          constraint.type !== 'angle' ||
          !constraint.points.every((point) => entity.vertices.includes(point))
        ) {
          continue;
        }
        const [first, vertex, third] = constraint.points;
        const firstSide = lengths.get(segmentKey([first, vertex]))!;
        const secondSide = lengths.get(segmentKey([vertex, third]))!;
        const opposite = lengths.get(segmentKey([first, third]))!;
        const cosine =
          (firstSide ** 2 + secondSide ** 2 - opposite ** 2) / (2 * firstSide * secondSide);
        const expected = (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;
        if (Math.abs(expected - constraint.value) > ANGLE_EPSILON) {
          return { valid: false, reason: 'Длины сторон противоречат заданному углу' };
        }
      }
    }
  }

  return { valid: true };
}
