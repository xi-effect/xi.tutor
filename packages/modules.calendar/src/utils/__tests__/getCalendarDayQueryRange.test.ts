import { describe, expect, it } from 'vitest';
import { getCalendarDayQueryRange } from '../getCalendarDayQueryRange';
import { toLocalISOString } from '../dateTimezone';

describe('getCalendarDayQueryRange', () => {
  it('берёт сутки до и после выбранного дня', () => {
    const day = new Date(2026, 3, 21, 15, 30, 0);
    const range = getCalendarDayQueryRange(day);

    const from = new Date(2026, 3, 20, 0, 0, 0, 0);
    const to = new Date(2026, 3, 23, 0, 0, 0, 0);

    expect(range.happensAfter).toBe(toLocalISOString(from));
    expect(range.happensBefore).toBe(toLocalISOString(to));
  });
});
