import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { formatFreeSlotDuration } from '../formatFreeSlotDuration';

const t = ((key: string, options?: { count?: number }) =>
  options?.count != null ? `${key}:${options.count}` : key) as TFunction;

const at = (hours: number, minutes = 0) => new Date(2026, 3, 21, hours, minutes, 0, 0);

describe('formatFreeSlotDuration', () => {
  it('форматирует целые часы', () => {
    expect(formatFreeSlotDuration(at(18), at(20), t)).toBe('free_slot_hours:2');
  });

  it('форматирует часы и минуты', () => {
    expect(formatFreeSlotDuration(at(12, 50), at(14), t)).toBe(
      'free_slot_hours:1 free_slot_minutes:10',
    );
  });

  it('форматирует только минуты', () => {
    expect(formatFreeSlotDuration(at(12), at(12, 30), t)).toBe('free_slot_minutes:30');
  });
});
