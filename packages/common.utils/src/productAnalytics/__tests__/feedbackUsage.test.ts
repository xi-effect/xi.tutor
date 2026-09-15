import { describe, expect, it } from 'vitest';
import {
  accrueActiveUsageMs,
  BOARD_FEEDBACK_IDLE_MS,
  FEEDBACK_ELIGIBLE_USAGE_MS,
  getFeedbackPromptEligibility,
  getFeedbackUsageDurationBucket,
} from '../feedbackUsage';

describe('accrueActiveUsageMs', () => {
  it('считает промежутки не длиннее idle', () => {
    expect(accrueActiveUsageMs(30_000)).toBe(30_000);
    expect(accrueActiveUsageMs(BOARD_FEEDBACK_IDLE_MS)).toBe(BOARD_FEEDBACK_IDLE_MS);
  });

  it('не считает простой и отрицательные gap', () => {
    expect(accrueActiveUsageMs(BOARD_FEEDBACK_IDLE_MS + 1)).toBe(0);
    expect(accrueActiveUsageMs(0)).toBe(0);
    expect(accrueActiveUsageMs(-10)).toBe(0);
  });
});

describe('getFeedbackUsageDurationBucket', () => {
  it('возвращает корзину только от 15 минут', () => {
    expect(getFeedbackUsageDurationBucket(14 * 60_000)).toBeNull();
    expect(getFeedbackUsageDurationBucket(FEEDBACK_ELIGIBLE_USAGE_MS)).toBe('15_30m');
    expect(getFeedbackUsageDurationBucket(29 * 60_000)).toBe('15_30m');
    expect(getFeedbackUsageDurationBucket(30 * 60_000)).toBe('30_45m');
    expect(getFeedbackUsageDurationBucket(44 * 60_000)).toBe('30_45m');
    expect(getFeedbackUsageDurationBucket(45 * 60_000)).toBe('45_60m');
    expect(getFeedbackUsageDurationBucket(59 * 60_000)).toBe('45_60m');
    expect(getFeedbackUsageDurationBucket(60 * 60_000)).toBe('60m_plus');
  });
});

describe('getFeedbackPromptEligibility', () => {
  it('кодирует комбинации eligible типов', () => {
    expect(getFeedbackPromptEligibility(true, false)).toBe('call_only');
    expect(getFeedbackPromptEligibility(false, true)).toBe('board_only');
    expect(getFeedbackPromptEligibility(true, true)).toBe('both');
    expect(getFeedbackPromptEligibility(false, false)).toBeNull();
  });
});
