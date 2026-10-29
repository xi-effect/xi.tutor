import {
  isSubscriptionPeriodActive,
  useSubscriptionPlan,
  useSubscriptionUiStore,
} from 'common.subscription';
import { useCurrentSubscription } from 'common.services';
import {
  getSubscriptionAnalyticsSource,
  isSubscriptionAnalyticsSource,
  toSubscriptionBillingPeriod,
  type SubscriptionAnalyticsSource,
  type SubscriptionBillingPeriod,
  type SubscriptionPurchaseContext,
} from 'common.utils';

export const resolveSubscriptionEntrySource = (): SubscriptionAnalyticsSource => {
  const fromStore = useSubscriptionUiStore.getState().analyticsSource;
  if (isSubscriptionAnalyticsSource(fromStore) && fromStore !== 'other') return fromStore;

  const stored = getSubscriptionAnalyticsSource();
  return stored === 'other' ? 'settings' : stored;
};

export const useSubscriptionPurchaseContext = (): SubscriptionPurchaseContext & {
  billingPeriod: SubscriptionBillingPeriod;
  ready: boolean;
} => {
  const { planId } = useSubscriptionPlan();
  const subscriptionQuery = useCurrentSubscription();
  const subscription = subscriptionQuery.data;
  const billingPeriod =
    toSubscriptionBillingPeriod(subscription?.auto_renewal?.renewal_period) ?? 'month';

  return {
    source: resolveSubscriptionEntrySource(),
    currentPlan: planId ?? undefined,
    wasActive: isSubscriptionPeriodActive(subscription?.subscription.ends_at),
    hadSubscription: subscription != null,
    autoRenewWasOn: Boolean(subscription?.auto_renewal),
    billingPeriod,
    ready: subscriptionQuery.isSuccess || subscriptionQuery.isError,
  };
};
