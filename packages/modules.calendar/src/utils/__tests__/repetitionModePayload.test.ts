import { describe, expect, it } from 'vitest';
import {
  buildRepetitionModeInput,
  FULL_WEEK_BITMASK,
  getActivePeriodDays,
  getRepeatUntil,
} from '../repetitionModePayload';

describe('getActivePeriodDays / getRepeatUntil', () => {
  it('возвращает null без даты окончания', () => {
    expect(getActivePeriodDays(new Date(2026, 3, 1), null)).toBeNull();
    expect(getRepeatUntil(new Date(2026, 3, 1), null)).toBeNull();
  });

  it('считает календарные дни включительно, а не через ms / 86400000', () => {
    const startsAt = new Date(2026, 2, 7, 23, 0, 0);
    const until = new Date(2026, 2, 9, 1, 0, 0);

    expect(getActivePeriodDays(startsAt, until)).toBe(3);
  });

  it('не даёт 0 при той же календарной дате — период в 1 день', () => {
    const startsAt = new Date(2026, 3, 1, 18, 0, 0);
    const until = new Date(2026, 3, 1, 9, 0, 0);

    expect(getActivePeriodDays(startsAt, until)).toBe(1);
  });

  it('отклоняет дату окончания раньше начала', () => {
    expect(getActivePeriodDays(new Date(2026, 3, 10), new Date(2026, 3, 9))).toBeNull();
  });

  it('восстанавливает дату окончания относительно starts_at', () => {
    const startsAt = new Date(2026, 3, 1, 17, 40, 0);
    const until = getRepeatUntil(startsAt, 30);

    expect(until).not.toBeNull();
    expect(until?.getFullYear()).toBe(2026);
    expect(until?.getMonth()).toBe(3);
    expect(until?.getDate()).toBe(30);
    expect(getActivePeriodDays(startsAt, until)).toBe(30);
  });
});

describe('buildRepetitionModeInput', () => {
  it('собирает daily при полной маске недели и передаёт active_period_days', () => {
    expect(
      buildRepetitionModeInput({
        startsAt: '2026-04-01T17:40:00+03:00',
        durationSeconds: 3600,
        weeklyBitmask: FULL_WEEK_BITMASK,
        activePeriodDays: 30,
      }),
    ).toEqual({
      kind: 'daily',
      starts_at: '2026-04-01T17:40:00+03:00',
      duration_seconds: 3600,
      active_period_days: 30,
    });
  });

  it('собирает weekly и допускает бессрочную серию (null)', () => {
    expect(
      buildRepetitionModeInput({
        startsAt: '2026-04-01T17:40:00+03:00',
        durationSeconds: 3600,
        weeklyBitmask: 0b0000101,
        activePeriodDays: null,
      }),
    ).toEqual({
      kind: 'weekly',
      starts_at: '2026-04-01T17:40:00+03:00',
      duration_seconds: 3600,
      weekly_bitmask: 0b0000101,
      active_period_days: null,
    });
  });
});
