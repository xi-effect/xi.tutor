import { describe, expect, it } from 'vitest';
import type { ScheduleLessonRow } from '../../ui/types';
import { getScheduleLessonEndAt } from '../getScheduleLessonEndAt';
import { getScheduleLessonStartAt } from '../getScheduleLessonStartAt';

const lesson = (overrides: Partial<ScheduleLessonRow> = {}): ScheduleLessonRow => ({
  id: 1,
  startTime: '10:30',
  endTime: '11:45',
  subject: 'Алгебра',
  studentName: 'Иван',
  studentId: 1,
  ...overrides,
});

describe('getScheduleLessonStartAt / getScheduleLessonEndAt', () => {
  const day = new Date(2026, 3, 21);

  it('собирает Date из lessonDay и HH:MM', () => {
    const start = getScheduleLessonStartAt(lesson(), day);
    const end = getScheduleLessonEndAt(lesson(), day);

    expect(start?.getFullYear()).toBe(2026);
    expect(start?.getMonth()).toBe(3);
    expect(start?.getDate()).toBe(21);
    expect(start?.getHours()).toBe(10);
    expect(start?.getMinutes()).toBe(30);
    expect(end?.getHours()).toBe(11);
    expect(end?.getMinutes()).toBe(45);
  });

  it('использует дату из startAt, подставляя часы из строк', () => {
    const startAt = new Date(2026, 5, 1, 8, 0, 0);
    const start = getScheduleLessonStartAt(lesson({ startAt }), undefined);
    expect(start?.getMonth()).toBe(5);
    expect(start?.getDate()).toBe(1);
    expect(start?.getHours()).toBe(10);
  });

  it('возвращает null без дня и при невалидном времени', () => {
    expect(getScheduleLessonStartAt(lesson(), undefined)).toBeNull();
    expect(getScheduleLessonStartAt(lesson({ startTime: 'bad' }), day)).toBeNull();
    expect(getScheduleLessonEndAt(lesson({ endTime: 'xx:yy' }), day)).toBeNull();
  });
});
