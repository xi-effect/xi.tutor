import { afterEach, describe, expect, it } from 'vitest';
import { setAppTimeZone } from 'common.utils';
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
    setAppTimeZone(null);
  });

  it('не сдвигает маску, если UTC и пояс приложения попадают в один день', () => {
    setAppTimeZone('Europe/Moscow');
    // 2026-04-20 — понедельник и в UTC, и в Москве (15:00)
    const mondayUtc = new Date('2026-04-20T12:00:00Z');
    const mask = weekdaysToBitmask([1]);
    expect(bitmaskUtcToLocal(mask, mondayUtc)).toBe(mask);
    expect(bitmaskLocalToUtc(mask, mondayUtc)).toBe(mask);
  });

  it('сдвигает вперёд, когда локальный день наступает раньше UTC', () => {
    setAppTimeZone('Europe/Moscow');
    // 23:00 UTC понедельника = 02:00 вторника в Москве
    const startsAt = new Date('2026-04-20T23:00:00Z');
    const utcMask = weekdaysToBitmask([0]);
    expect(bitmaskUtcToLocal(utcMask, startsAt)).toBe(weekdaysToBitmask([1]));
    expect(bitmaskLocalToUtc(weekdaysToBitmask([1]), startsAt)).toBe(utcMask);
  });

  it('roundtrip utc→local→utc сохраняет маску при сдвиге', () => {
    setAppTimeZone('Europe/Moscow');
    const startsAt = new Date('2026-04-20T23:00:00Z');
    const utcMask = weekdaysToBitmask([0, 2, 4]);
    const localMask = bitmaskUtcToLocal(utcMask, startsAt);
    expect(bitmaskLocalToUtc(localMask, startsAt)).toBe(utcMask);
  });
});
