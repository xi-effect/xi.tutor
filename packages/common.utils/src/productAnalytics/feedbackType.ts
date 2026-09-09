import type { ProductAnalyticsFeedbackType } from './types';

export type FeedbackEligibility = {
  callEligible: boolean;
  boardEligible: boolean;
};

/**
 * Один показ — один тип. Если eligible и ВКС, и доска, чередуем относительно
 * предыдущего показа, чтобы не застревать на одном типе.
 */
export function pickFeedbackType(
  eligibility: FeedbackEligibility,
  lastType: ProductAnalyticsFeedbackType | null,
): ProductAnalyticsFeedbackType | null {
  const { callEligible, boardEligible } = eligibility;

  if (!callEligible && !boardEligible) return null;
  if (callEligible && !boardEligible) return 'call';
  if (!callEligible && boardEligible) return 'board';

  if (lastType === 'call') return 'board';
  if (lastType === 'board') return 'call';
  return 'call';
}
