import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateRangeDisplay,
  getLessonCardSkeletonCountForDay,
  getWeekStartForCenteredDate,
  getWeekStartForVisibleWindow,
  isPastDay,
  isWeekend,
  parseDateTime,
} from '../calendarUtils';

describe('calendarUtils window helpers', () => {
  const anchor = new Date(2026, 6, 31); // 31 июля 2026, пятница

  it('getWeekStartForVisibleWindow ставит anchor последним днём', () => {
    const start = getWeekStartForVisibleWindow(anchor, 5);
    expect(formatDate(start)).toBe('27.07.2026');
  });

  it('getWeekStartForCenteredDate центрирует anchor', () => {
    const start = getWeekStartForCenteredDate(anchor, 5);
    expect(formatDate(start)).toBe('29.07.2026');
  });
});

describe('calendarUtils day checks', () => {
  it('isWeekend / isPastDay', () => {
    expect(isWeekend(new Date(2026, 3, 18))).toBe(true); // сб
    expect(isWeekend(new Date(2026, 3, 20))).toBe(false); // пн
    expect(isPastDay(new Date(2026, 3, 20), new Date(2026, 3, 21))).toBe(true);
    expect(isPastDay(new Date(2026, 3, 21), new Date(2026, 3, 21))).toBe(false);
  });
});

describe('calendarUtils format/parse', () => {
  it('formatDate / parseDateTime', () => {
    const date = new Date(2026, 3, 21, 10, 30);
    expect(formatDate(date)).toBe('21.04.2026');
    const parsed = parseDateTime('21.04.2026', '10:30');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(3);
    expect(parsed.getDate()).toBe(21);
    expect(parsed.getHours()).toBe(10);
    expect(parsed.getMinutes()).toBe(30);
  });

  it('formatDateRangeDisplay без/с годом на границе', () => {
    expect(formatDateRangeDisplay(new Date(2026, 2, 2), 7, 'ru-RU')).toContain('—');
    expect(formatDateRangeDisplay(new Date(2025, 11, 30), 5, 'ru-RU')).toMatch(/2025/);
    expect(formatDateRangeDisplay(new Date(2025, 11, 30), 5, 'ru-RU')).toMatch(/2026/);
  });

  it('getLessonCardSkeletonCountForDay стабилен для одной даты', () => {
    const day = new Date(2026, 3, 21);
    expect(getLessonCardSkeletonCountForDay(day)).toBe(getLessonCardSkeletonCountForDay(day));
    expect(getLessonCardSkeletonCountForDay(day)).toBeGreaterThanOrEqual(2);
    expect(getLessonCardSkeletonCountForDay(day)).toBeLessThanOrEqual(5);
  });
});
