import { describe, expect, it } from 'vitest';
import { toLocalISOString } from '../dateTimezone';

describe('toLocalISOString', () => {
  it('форматирует дату с явным offset, а не Z', () => {
    const date = new Date(2026, 3, 21, 9, 30, 15); // local components
    const result = toLocalISOString(date);

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    expect(result).not.toContain('Z');
    expect(result.startsWith('2026-04-21T09:30:15')).toBe(true);
  });

  it('использует offset, согласованный с getTimezoneOffset', () => {
    const date = new Date('2026-04-21T10:00:00Z');
    const result = toLocalISOString(date);
    const tzOffsetMinutes = -date.getTimezoneOffset();
    const sign = tzOffsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(tzOffsetMinutes);
    const expectedSuffix = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;

    expect(result.endsWith(expectedSuffix)).toBe(true);
  });
});
