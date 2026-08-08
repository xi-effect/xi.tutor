import type { ProductAnalyticsDurationBucket } from './types';

const DURATION_THRESHOLDS_MIN = [5, 15, 30, 45, 60] as const;

export type LessonDurationThresholdMin = (typeof DURATION_THRESHOLDS_MIN)[number];

export function getDurationBucket(elapsedMinutes: number): ProductAnalyticsDurationBucket {
  if (elapsedMinutes >= 45) return '45+';
  if (elapsedMinutes >= 30) return '30-45';
  if (elapsedMinutes >= 15) return '15-30';
  return '5-15';
}

export function getReachedDurationThresholds(elapsedMinutes: number): LessonDurationThresholdMin[] {
  return DURATION_THRESHOLDS_MIN.filter((threshold) => elapsedMinutes >= threshold);
}

export { DURATION_THRESHOLDS_MIN };
