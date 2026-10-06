import { useCurrentPlan } from 'common.services';
import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import { canUseFeature, type SubscriptionFeatureId } from './features';
import { mergePlanLimits, planKindToPlanId } from './planCache';
import { getCurrentTariff } from './limits';
import { TARIFFS, type TariffLimits } from './tariffs';

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
