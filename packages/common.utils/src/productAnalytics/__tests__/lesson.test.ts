import { describe, expect, it } from 'vitest';
import {
  getDurationBucket,
  getReachedDurationThresholds,
  DURATION_THRESHOLDS_MIN,
} from '../lesson';

describe('getDurationBucket', () => {
  it('возвращает корректный bucket по минутам', () => {
    expect(getDurationBucket(5)).toBe('5-15');
    expect(getDurationBucket(14)).toBe('5-15');
    expect(getDurationBucket(15)).toBe('15-30');
    expect(getDurationBucket(30)).toBe('30-45');
    expect(getDurationBucket(45)).toBe('45+');
    expect(getDurationBucket(90)).toBe('45+');
  });
});

describe('getReachedDurationThresholds', () => {
  it('возвращает достигнутые пороги', () => {
    expect(getReachedDurationThresholds(0)).toEqual([]);
    expect(getReachedDurationThresholds(5)).toEqual([5]);
    expect(getReachedDurationThresholds(30)).toEqual([5, 15, 30]);
    expect(getReachedDurationThresholds(60)).toEqual([...DURATION_THRESHOLDS_MIN]);
  });
});
