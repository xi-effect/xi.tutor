import { useClassroomCounts, useCurrentPlan, useCurrentUser } from 'common.services';
import { canUseSubscriptionCommerce } from './commerce';
import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import { canUseFeature, type SubscriptionFeatureId } from './features';
import { mergePlanLimits, planKindToPlanId } from './planCache';
import { getCurrentTariff } from './limits';
import { TARIFFS, type TariffLimits } from './tariffs';

export const useCanUseSubscriptionCommerce = () => {
  const { data: user, isSuccess } = useCurrentUser();
  const userId = typeof user?.id === 'number' ? user.id : null;

  return {
    allowed: canUseSubscriptionCommerce(userId),
    isReady: isSuccess,
  };
};

export const useSubscriptionPlan = () => {
  const planQuery = useCurrentPlan();
  const plan = planQuery.data;
  const planId = plan ? planKindToPlanId(plan.kind) : null;
  const tariff = plan ? mergePlanLimits(plan) : null;

  return {
    planId,
    tariff,
    isPro: plan?.kind === 'pro',
    isBasic: Boolean(plan) && plan?.kind !== 'pro',
    isPlanReady: planQuery.isSuccess,
    isPlanError: planQuery.isError,
    isPlanLoading: planQuery.isPending && planQuery.fetchStatus !== 'idle',
    refetchPlan: planQuery.refetch,
  };
};

export const usePlanLimits = (): TariffLimits => {
  const { tariff } = useSubscriptionPlan();
  return tariff ?? TARIFFS.basic;
};

export const useCanUseFeature = (featureId: SubscriptionFeatureId): boolean => {
  const { isPlanReady, planId } = useSubscriptionPlan();
  if (!SUBSCRIPTION_BILLING_ENABLED) return true;
  if (!isPlanReady || !planId) return true;
  return canUseFeature(featureId, planId);
};

export const useCurrentTariff = () => {
  const { tariff } = useSubscriptionPlan();
  return tariff ?? getCurrentTariff();
};

export const useCanActivateClassroom = (): boolean => {
  const { tariff, isPlanReady } = useSubscriptionPlan();
  const countQuery = useClassroomCounts();

  if (!SUBSCRIPTION_BILLING_ENABLED) return true;
  if (!isPlanReady || !tariff) return true;
  if (typeof countQuery.data?.active !== 'number') return true;

  return countQuery.data.active < tariff.maxActiveClassrooms;
};
