import { describe, expect, it } from 'vitest';
import { getCalendarDayQueryRange } from '../getCalendarDayQueryRange';
import { toLocalISOString } from '../dateTimezone';

describe('getCalendarDayQueryRange', () => {
  it('строит диапазон локального дня [00:00, next midnight]', () => {
    const day = new Date(2026, 3, 21, 15, 30, 0);
    const range = getCalendarDayQueryRange(day);

    const start = new Date(2026, 3, 21, 0, 0, 0, 0);
    const endInclusive = new Date(2026, 3, 21, 23, 59, 59, 999);

    expect(range.happensAfter).toBe(toLocalISOString(start));
    expect(range.happensBefore).toBe(toLocalISOString(new Date(endInclusive.getTime() + 1)));
  });
});
