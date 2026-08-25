import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  bitmaskLocalToUtc,
  bitmaskToWeekdays,
  bitmaskUtcToLocal,
  weekdaysToBitmask,
} from '../bitmaskTimezone';

describe('weekdaysToBitmask / bitmaskToWeekdays', () => {
  it('кодирует и декодирует дни недели', () => {
    expect(weekdaysToBitmask([0, 1])).toBe(0b0000011);
    expect(bitmaskToWeekdays(0b0000011)).toEqual([0, 1]);
  });

  it('поддерживает воскресенье (бит 6)', () => {
    expect(weekdaysToBitmask([6])).toBe(0b1000000);
    expect(bitmaskToWeekdays(0b1000000)).toEqual([6]);
  });

  it('roundtrip для полной недели', () => {
    const days = [0, 1, 2, 3, 4, 5, 6];
    expect(bitmaskToWeekdays(weekdaysToBitmask(days))).toEqual(days);
  });
});

describe('bitmaskUtcToLocal / bitmaskLocalToUtc', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('не сдвигает маску, если UTC и local день совпадают', () => {
    const mondayUtc = new Date('2026-04-20T12:00:00Z');
    vi.spyOn(Date.prototype, 'getUTCDay').mockReturnValue(1); // Пн
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(1); // Пн

    const mask = weekdaysToBitmask([1]); // Вт
    expect(bitmaskUtcToLocal(mask, mondayUtc)).toBe(mask);
    expect(bitmaskLocalToUtc(mask, mondayUtc)).toBe(mask);
  });

  it('сдвигает вперёд для UTC+ (Пн UTC → Вт local)', () => {
    const startsAt = new Date('2026-04-20T23:00:00Z');
    vi.spyOn(Date.prototype, 'getUTCDay').mockReturnValue(1); // Пн UTC
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(2); // Вт local

    // UTC-битмаска: только понедельник (бит 0)
    const utcMask = weekdaysToBitmask([0]);
    // В local должно стать вторник (бит 1)
    expect(bitmaskUtcToLocal(utcMask, startsAt)).toBe(weekdaysToBitmask([1]));
    expect(bitmaskLocalToUtc(weekdaysToBitmask([1]), startsAt)).toBe(utcMask);
  });

  it('roundtrip utc→local→utc сохраняет маску при сдвиге', () => {
    const startsAt = new Date('2026-04-20T23:00:00Z');
    vi.spyOn(Date.prototype, 'getUTCDay').mockReturnValue(1);
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(2);

    const utcMask = weekdaysToBitmask([0, 2, 4]);
    const localMask = bitmaskUtcToLocal(utcMask, startsAt);
    expect(bitmaskLocalToUtc(localMask, startsAt)).toBe(utcMask);
  });
});
