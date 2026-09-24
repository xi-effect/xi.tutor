import type {
  ProductAnalyticsFeedbackEligibility,
  ProductAnalyticsFeedbackType,
  ProductAnalyticsFeedbackUsageDurationBucket,
} from './types';

export const FEEDBACK_ELIGIBLE_USAGE_MS = 15 * 60 * 1000;
export const BOARD_FEEDBACK_IDLE_MS = 2 * 60 * 1000;

const MINUTE_MS = 60 * 1000;

/**
 * Добавляет промежуток между meaningful-действиями, если он не длиннее idle.
 * Открытая вкладка без действий и gap > idle не считаются.
 */
export function accrueActiveUsageMs(gapMs: number, idleMs = BOARD_FEEDBACK_IDLE_MS): number {
  if (!Number.isFinite(gapMs) || gapMs <= 0) return 0;
  if (gapMs > idleMs) return 0;
  return gapMs;
}

export function getFeedbackUsageDurationBucket(
  durationMs: number,
): ProductAnalyticsFeedbackUsageDurationBucket | null {
  if (durationMs < FEEDBACK_ELIGIBLE_USAGE_MS) return null;
  if (durationMs < 30 * MINUTE_MS) return '15_30m';
  if (durationMs < 45 * MINUTE_MS) return '30_45m';
  if (durationMs < 60 * MINUTE_MS) return '45_60m';
  return '60m_plus';
}

export function getFeedbackPromptEligibility(
  callEligible: boolean,
  boardEligible: boolean,
): ProductAnalyticsFeedbackEligibility | null {
  if (callEligible && boardEligible) return 'both';
  if (callEligible) return 'call_only';
  if (boardEligible) return 'board_only';
  return null;
}

export function getShownFeedbackUsageMs(
  type: ProductAnalyticsFeedbackType,
  usage: { callConnectedMs: number; boardActiveMs: number },
): number {
  return type === 'call' ? usage.callConnectedMs : usage.boardActiveMs;
}
