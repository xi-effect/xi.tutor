import { describe, expect, it } from 'vitest';
import { DICE_SIDES, normalizeDiceFace, rollDie } from '../diceRoll';
import {
  cubePose,
  cubeRestRotation,
  faceSequence,
  mod360,
  spinAngle,
  spinFaces,
  DICE_SPIN_STEPS,
} from '../diceMotion';

describe('rollDie', () => {
  it('возвращает грань от 1 до числа граней', () => {
    for (const sides of DICE_SIDES) {
      expect(rollDie(sides, () => 0)).toBe(1);
      expect(rollDie(sides, () => 0.999999)).toBe(sides);
    }
  });
});

describe('normalizeDiceFace', () => {
  it('оставляет допустимую пару и подставляет d6 для мусора', () => {
    expect(normalizeDiceFace(20, 20)).toEqual({ sides: 20, value: 20 });
    expect(normalizeDiceFace(3, 9)).toEqual({ sides: 6, value: 1 });
    expect(normalizeDiceFace(8, 0)).toEqual({ sides: 8, value: 1 });
  });
});

describe('dice motion', () => {
  it('кубик d6 останавливается нужной гранью к зрителю', () => {
    for (const value of [1, 2, 3, 4, 5, 6]) {
      const rest = cubeRestRotation(value);
      const pose = cubePose(1, value, 13);
      expect(mod360(pose.rotateX)).toBe(mod360(rest.x));
      expect(mod360(pose.rotateY)).toBe(mod360(rest.y));
    }
  });

  it('последняя видимая грань совпадает с выпавшим числом', () => {
    const sequence = faceSequence(12, 9, 42, DICE_SPIN_STEPS);
    expect(sequence.at(-1)).toBe(9);
    expect(sequence.slice(0, -1).every((face) => face !== 9)).toBe(true);
    expect(spinFaces(sequence, spinAngle(1)).front).toBe(9);
  });
});
