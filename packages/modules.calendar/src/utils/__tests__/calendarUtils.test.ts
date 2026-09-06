import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateRangeDisplay,
  getLessonCardSkeletonCountForDay,
  getWeekStartForCenteredDate,
  getWeekStartForVisibleWindow,
  isPastDay,
  isCalendarEventInPast,
  isWeekend,
  parseDateTime,
} from '../calendarUtils';

describe('calendarUtils window helpers', () => {
  const anchor = new Date(2026, 6, 31); // 31 июля 2026, пятница

  it('getWeekStartForVisibleWindow ставит anchor первым днём', () => {
    const start = getWeekStartForVisibleWindow(anchor);
    expect(formatDate(start)).toBe('31.07.2026');
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

  it('isCalendarEventInPast по окончанию слота', () => {
    const now = new Date(2026, 3, 21, 15, 0, 0);
    expect(
      isCalendarEventInPast(
        { start: new Date(2026, 3, 21, 13, 0, 0), end: new Date(2026, 3, 21, 14, 0, 0) },
        now,
      ),
    ).toBe(true);
    expect(
      isCalendarEventInPast(
        { start: new Date(2026, 3, 21, 16, 0, 0), end: new Date(2026, 3, 21, 17, 0, 0) },
        now,
      ),
    ).toBe(false);
    expect(
      isCalendarEventInPast(
        {
          start: new Date(2026, 3, 20),
          end: new Date(2026, 3, 20),
          isAllDay: true,
        },
        now,
      ),
    ).toBe(true);
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

  it('formatDateRangeDisplay без года даже на границе лет', () => {
    const sameYear = formatDateRangeDisplay(new Date(2026, 2, 2), 7, 'ru-RU');
    expect(sameYear).toContain('—');
    expect(sameYear).toMatch(/\d+ \p{L}{3}/u);
    expect(sameYear).not.toMatch(/марта|августа|декабря|января/i);
    expect(sameYear).not.toMatch(/20\d{2}/);

    const crossYear = formatDateRangeDisplay(new Date(2025, 11, 30), 5, 'ru-RU');
    expect(crossYear).toContain('—');
    expect(crossYear).not.toMatch(/20\d{2}/);
  });

  it('getLessonCardSkeletonCountForDay стабилен для одной даты', () => {
    const day = new Date(2026, 3, 21);
    expect(getLessonCardSkeletonCountForDay(day)).toBe(getLessonCardSkeletonCountForDay(day));
    expect(getLessonCardSkeletonCountForDay(day)).toBeGreaterThanOrEqual(2);
    expect(getLessonCardSkeletonCountForDay(day)).toBeLessThanOrEqual(5);
  });
});
