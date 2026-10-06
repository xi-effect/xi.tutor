import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import { readCachedPlanId } from './planCache';
import type { PlanId } from './tariffs';

export const SUBSCRIPTION_FEATURE_IDS = ['extraProTools'] as const;

export type SubscriptionFeatureId = (typeof SUBSCRIPTION_FEATURE_IDS)[number];

const FEATURE_MIN_PLAN: Record<SubscriptionFeatureId, PlanId> = {
  extraProTools: 'pro',
};

const PLAN_RANK: Record<PlanId, number> = {
  basic: 0,
  pro: 1,
};

export const getFeatureMinPlan = (featureId: SubscriptionFeatureId): PlanId =>
  FEATURE_MIN_PLAN[featureId];

export const canUseFeature = (featureId: SubscriptionFeatureId, planId?: PlanId): boolean => {
  if (!SUBSCRIPTION_BILLING_ENABLED) return true;

  const resolved = planId ?? readCachedPlanId();
  if (!resolved) return true;

  return PLAN_RANK[resolved] >= PLAN_RANK[FEATURE_MIN_PLAN[featureId]];
};
