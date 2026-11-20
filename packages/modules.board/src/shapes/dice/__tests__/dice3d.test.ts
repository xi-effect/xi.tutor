import { describe, expect, it } from 'vitest';

function edgeAngles(points: string) {
  const ring = points.split(' ').map((pair) => pair.split(',').map(Number) as [number, number]);
  return ring.map((current, index) => {
    const next = ring[(index + 1) % ring.length];
    const angle = Math.abs(
      (Math.atan2(next[1] - current[1], next[0] - current[0]) * 180) / Math.PI,
    );
    return Math.min(angle, 180 - angle);
  });
}

function lowestEdgeAngle(points: string) {
  const ring = points.split(' ').map((pair) => pair.split(',').map(Number) as [number, number]);
  let best = 90;
  let lowest = Infinity;

  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index];
    const next = ring[(index + 1) % ring.length];
    const midY = (current[1] + next[1]) / 2;
    if (midY < lowest) {
      lowest = midY;
      best = Math.abs((Math.atan2(next[1] - current[1], next[0] - current[0]) * 180) / Math.PI);
    }
  }

  return Math.min(best, 180 - best);
}
import { DICE_SIDES } from '../../../dice/diceRoll';
import { dieModel, frontFaceValue, projectDie } from '../dice3d';

describe('объёмные кости', () => {
  it('у каждой кости ровно столько граней, сколько на ней написано', () => {
    for (const sides of DICE_SIDES) {
      const values = dieModel(sides)
        .faces.filter((face) => face.value > 0)
        .map((face) => face.value)
        .sort((a, b) => a - b);
      expect(values).toEqual(Array.from({ length: sides }, (_, index) => index + 1));
    }
  });

  it('после броска к зрителю повёрнута выпавшая грань', () => {
    for (const sides of DICE_SIDES) {
      for (const value of [1, sides]) {
        expect(frontFaceValue(sides, value, 11, 1)).toBe(value);
      }
    }
  });

  it('в полёте видно несколько граней объёмной кости', () => {
    const faces = projectDie(20, 14, 7, 0.35, 128);
    expect(faces.length).toBeGreaterThan(3);
  });

  it('в покое остаётся та же грань объёмной кости, ровно к зрителю', () => {
    const octahedron = projectDie(8, 3, 5, 1, 128).filter((face) => face.value > 0);
    expect(octahedron).toHaveLength(1);
    expect(octahedron[0]?.points.split(' ')).toHaveLength(3);
    expect(octahedron[0]?.label?.text).toBe('3');
    expect(Math.abs(octahedron[0]?.label?.rotate ?? 90)).toBeLessThan(1);
    const angles = edgeAngles(octahedron[0]?.points ?? '');
    expect(Math.min(...angles)).toBeLessThan(2);
    expect(lowestEdgeAngle(octahedron[0]?.points ?? '')).toBeLessThan(2);

    const cube = projectDie(6, 4, 3, 1, 128).filter((face) => face.pips.length > 0);
    expect(cube).toHaveLength(1);
    expect(cube[0]?.points.split(' ')).toHaveLength(4);
    expect(cube[0]?.pips).toHaveLength(4);

    const dodecahedron = projectDie(12, 7, 3, 1, 128).filter((face) => face.label);
    expect(dodecahedron[0]?.points.split(' ')).toHaveLength(5);
    expect(dodecahedron[0]?.label?.text).toBe('7');
  });
});
