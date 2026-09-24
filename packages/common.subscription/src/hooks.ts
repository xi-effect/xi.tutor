import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import { canUseFeature, type SubscriptionFeatureId } from './features';
import { getCurrentTariff } from './limits';
import { getRemainingSubscriptionDays } from './period';
import { useSubscriptionStore } from './store';
import { TARIFFS, type TariffLimits } from './tariffs';

export const useSubscriptionPlan = () => {
  const planId = useSubscriptionStore((state) => state.planId);
  const autoRenew = useSubscriptionStore((state) => state.autoRenew);
  const renewsAt = useSubscriptionStore((state) => state.renewsAt);
  const mock = useSubscriptionStore((state) => state.mock);
  const tariff = TARIFFS[planId];
  const remainingDays = getRemainingSubscriptionDays(planId, renewsAt);

  return {
    planId,
    autoRenew,
    renewsAt,
    remainingDays,
    mock,
    tariff,
    isPro: planId === 'pro',
    isBasic: planId === 'basic',
  };
};

export const usePlanLimits = (): TariffLimits => {
  const planId = useSubscriptionStore((state) => state.planId);
  return TARIFFS[planId];
};

export const useCanUseFeature = (featureId: SubscriptionFeatureId): boolean => {
  const planId = useSubscriptionStore((state) => state.planId);
  if (!SUBSCRIPTION_BILLING_ENABLED) return true;
  return canUseFeature(featureId, planId);
};

export const useCurrentTariff = () =>
  getCurrentTariff(useSubscriptionStore((state) => state.planId));
