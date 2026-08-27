import { describe, expect, it } from 'vitest';
import {
  MAX_LESSON_DURATION_MINUTES,
  addDurationToTime,
  durationBetweenMinutes,
  getTimePickerHours,
  getTimePickerMinutes,
  minutesToTime,
  resolveSyncedEndTime,
  timeToMinutes,
} from '../utils';

describe('lesson.move duration utils', () => {
  it('конвертирует время', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(minutesToTime(570)).toBe('09:30');
  });

  it('считает длительность и overnight', () => {
    expect(durationBetweenMinutes('10:00', '11:20')).toBe(80);
    expect(durationBetweenMinutes('23:00', '01:00')).toBe(120);
    expect(durationBetweenMinutes('10:00', '10:00')).toBe(0);
    expect(durationBetweenMinutes('08:00', '20:00')).toBe(MAX_LESSON_DURATION_MINUTES);
  });

  it('прибавляет длительность', () => {
    expect(addDurationToTime('10:00', '1:30')).toBe('11:30');
    expect(addDurationToTime('23:30', '1:00')).toBe('00:30');
  });
});

describe('time picker slots', () => {
  it('для конца фильтрует слоты относительно начала', () => {
    expect(getTimePickerHours('19:00')[0]).toBe(19);
    expect(getTimePickerMinutes(19, '19:00')).toEqual([15, 30, 45]);
    expect(getTimePickerMinutes(20, '19:00')).toEqual([0, 15, 30, 45]);
  });

  it('синхронизирует конец, если он пустой или невалидный', () => {
    expect(resolveSyncedEndTime('19:00', '')).toBe('20:00');
    expect(resolveSyncedEndTime('19:00', '21:30')).toBeUndefined();
    expect(resolveSyncedEndTime('19:00', '19:00')).toBe('20:00');
  });
});
