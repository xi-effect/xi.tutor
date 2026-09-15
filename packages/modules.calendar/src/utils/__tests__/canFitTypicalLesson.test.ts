import { describe, expect, it } from 'vitest';
import { canFitTypicalLesson } from '../canFitTypicalLesson';

const at = (hours: number, minutes = 0) => new Date(2026, 3, 21, hours, minutes, 0, 0);

describe('canFitTypicalLesson', () => {
  it('подсвечивает окно, если длительность занятия помещается', () => {
    expect(canFitTypicalLesson(at(12, 50), at(14), 60)).toBe(true);
    expect(canFitTypicalLesson(at(18), at(20), 60)).toBe(true);
  });

  it('не подсвечивает более короткое окно', () => {
    expect(canFitTypicalLesson(at(12), at(12, 30), 60)).toBe(false);
    expect(canFitTypicalLesson(at(17), at(17, 50), 60)).toBe(false);
  });

  it('считает граничное совпадение достаточным', () => {
    expect(canFitTypicalLesson(at(10), at(10, 45), 45)).toBe(true);
  });
});
