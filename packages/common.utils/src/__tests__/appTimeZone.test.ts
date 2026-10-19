import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatAppClock,
  formatWallClockISOString,
  getAppTimeZone,
  getTimeZoneOffsetMinutes,
  instantToWallClock,
  setAppTimeZone,
} from '../appTimeZone';

describe('appTimeZone', () => {
  afterEach(() => {
    setAppTimeZone(null);
    vi.unstubAllGlobals();
  });

  it('переводит абсолютный момент в настенное время Москвы', () => {
    const wall = instantToWallClock('2026-04-21T07:00:00Z', 'Europe/Moscow');
    expect(wall.getFullYear()).toBe(2026);
    expect(wall.getMonth()).toBe(3);
    expect(wall.getDate()).toBe(21);
    expect(wall.getHours()).toBe(10);
    expect(wall.getMinutes()).toBe(0);
  });

  it('пишет настенные поля с offset выбранного пояса', () => {
    const wall = new Date(2026, 3, 21, 9, 30, 15);
    expect(formatWallClockISOString(wall, 'Europe/Moscow')).toBe('2026-04-21T09:30:15+03:00');
    expect(formatWallClockISOString(wall, 'Asia/Kolkata')).toBe('2026-04-21T09:30:15+05:30');
  });

  it('считает смещение Индии +05:30', () => {
    expect(getTimeZoneOffsetMinutes('Asia/Kolkata', new Date('2026-01-01T00:00:00Z'))).toBe(330);
  });

  it('форматирует часы в выбранном поясе', () => {
    expect(formatAppClock('2026-04-21T07:00:00Z', 'Asia/Tokyo')).toBe('16:00');
  });

  it('запоминает выбранный пояс', () => {
    const setItem = vi.fn();
    const removeItem = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem,
      removeItem,
    });

    setAppTimeZone('Europe/Moscow');
    expect(getAppTimeZone()).toBe('Europe/Moscow');
    expect(setItem).toHaveBeenCalledWith('xi_timezone', 'Europe/Moscow');

    setAppTimeZone(null);
    expect(removeItem).toHaveBeenCalledWith('xi_timezone');
  });

  it('игнорирует неизвестный пояс', () => {
    const before = getAppTimeZone();
    setAppTimeZone('Not/AZone');
    expect(getAppTimeZone()).toBe(before);
  });
});
