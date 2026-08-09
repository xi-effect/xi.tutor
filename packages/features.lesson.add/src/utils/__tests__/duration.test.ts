import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import {
  MAX_LESSON_DURATION_MINUTES,
  addDurationToTime,
  durationBetweenMinutes,
  formatDurationBetween,
  minutesToTime,
  timeToMinutes,
} from '../index';

const t = ((key: string, options?: { count?: number }) =>
  options?.count != null ? `${key}:${options.count}` : key) as TFunction;

describe('timeToMinutes / minutesToTime', () => {
  it('конвертирует время в минуты и обратно', () => {
    expect(timeToMinutes('09:30')).toBe(9 * 60 + 30);
    expect(minutesToTime(9 * 60 + 30)).toBe('09:30');
    expect(minutesToTime(24 * 60 + 15)).toBe('00:15');
  });
});

describe('durationBetweenMinutes', () => {
  it('считает длительность в пределах дня', () => {
    expect(durationBetweenMinutes('10:00', '11:20')).toBe(80);
  });

  it('считает overnight как переход через полночь', () => {
    expect(durationBetweenMinutes('23:00', '01:00')).toBe(120);
  });

  it('возвращает 0 при одинаковом start и end', () => {
    expect(durationBetweenMinutes('10:00', '10:00')).toBe(0);
  });

  it('граница max duration = 12 часов', () => {
    expect(durationBetweenMinutes('08:00', '20:00')).toBe(MAX_LESSON_DURATION_MINUTES);
    expect(durationBetweenMinutes('08:00', '20:01')).toBe(MAX_LESSON_DURATION_MINUTES + 1);
  });
});

describe('addDurationToTime', () => {
  it('прибавляет длительность к старту', () => {
    expect(addDurationToTime('10:00', '1:30')).toBe('11:30');
    expect(addDurationToTime('23:30', '1:00')).toBe('00:30');
  });
});

describe('formatDurationBetween', () => {
  it('форматирует часы и минуты через t', () => {
    expect(formatDurationBetween('10:00', '11:20', t)).toBe('hours:1 minutes:20');
  });

  it('возвращает пустую строку для невалидных/нулевых значений', () => {
    expect(formatDurationBetween('bad', '11:00', t)).toBe('');
    expect(formatDurationBetween('10:00', '10:00', t)).toBe('');
  });
});
