import { useClassroomCounts, useCurrentPlan, useCurrentUser } from 'common.services';
import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import { canUseFeature, type SubscriptionFeatureId } from './features';
import { mergePlanLimits, planKindToPlanId } from './planCache';
import { getCurrentTariff } from './limits';
import type { TariffLimits } from './tariffs';

export const useSubscriptionPlan = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const planQuery = useCurrentPlan();
  const plan = isTutor ? planQuery.data : undefined;
  const planId = plan ? planKindToPlanId(plan.kind) : null;
  const tariff = plan ? mergePlanLimits(plan) : null;

  return {
    planId,
    tariff,
    isPro: plan?.kind === 'pro',
    isBasic: Boolean(plan) && plan?.kind !== 'pro',
    isPlanReady: isTutor && planQuery.isSuccess,
    isPlanError: isTutor && planQuery.isError,
    isPlanLoading: isTutor && planQuery.isPending && planQuery.fetchStatus !== 'idle',
    refetchPlan: planQuery.refetch,
  };
};

export const usePlanLimits = (): TariffLimits => {
  const { tariff } = useSubscriptionPlan();
  return tariff ?? getCurrentTariff();
};

export const useCanUseFeature = (featureId: SubscriptionFeatureId): boolean => {
  const { isPlanReady, planId } = useSubscriptionPlan();
  if (!SUBSCRIPTION_BILLING_ENABLED) return true;
  if (!isPlanReady || !planId) return true;
  return canUseFeature(featureId, planId);
};

export const useCanActivateClassroom = (): boolean => {
  const { tariff, isPlanReady } = useSubscriptionPlan();
  const countQuery = useClassroomCounts();

  if (!SUBSCRIPTION_BILLING_ENABLED) return true;
  if (!isPlanReady || !tariff) return true;
  if (typeof countQuery.data?.active !== 'number') return true;

  return countQuery.data.active < tariff.maxActiveClassrooms;
};
