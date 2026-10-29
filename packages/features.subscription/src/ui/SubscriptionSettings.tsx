import { useEffect, useRef } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useCurrentUser } from 'common.services';
import { useSubscriptionUiStore } from 'common.subscription';
import {
  hasActiveSubscriptionFlow,
  isSubscriptionAnalyticsSource,
  setSubscriptionAnalyticsSource,
  trackSubscriptionPlanSelected,
} from 'common.utils';
import { useSubscriptionPurchaseContext } from '../analytics';
import { readCheckoutPeriod, SubscriptionCheckout } from './SubscriptionCheckout';
import { SubscriptionManage } from './SubscriptionManage';
import { SubscriptionOverview } from './SubscriptionOverview';

export const SubscriptionSettings = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const screen = useSubscriptionUiStore((state) => state.screen);
  const analyticsSource = useSubscriptionUiStore((state) => state.analyticsSource);
  const openCheckout = useSubscriptionUiStore((state) => state.openCheckout);
  const search = useSearch({ strict: false }) as { period?: string };
  const purchase = useSubscriptionPurchaseContext();
  const appliedPeriod = useRef<string | null>(null);

  useEffect(() => {
    if (!isSubscriptionAnalyticsSource(analyticsSource)) return;
    setSubscriptionAnalyticsSource(analyticsSource);
  }, [analyticsSource]);

  useEffect(() => {
    const period = search.period;
    const checkoutPeriod = readCheckoutPeriod(period);
    if (
      !isTutor ||
      !period ||
      !checkoutPeriod ||
      appliedPeriod.current === period ||
      !purchase.ready
    ) {
      return;
    }

    appliedPeriod.current = period;
    const source = isSubscriptionAnalyticsSource(analyticsSource) ? analyticsSource : 'pricing';
    if (source === 'pricing' && analyticsSource !== 'pricing') {
      setSubscriptionAnalyticsSource('pricing');
      useSubscriptionUiStore.getState().setAnalyticsSource('pricing');
    }
    openCheckout();

    if (!hasActiveSubscriptionFlow()) {
      trackSubscriptionPlanSelected({
        source,
        currentPlan: purchase.currentPlan,
        targetPlan: 'pro',
        billingPeriod: checkoutPeriod === 'yearly' ? 'year' : 'month',
        wasActive: purchase.wasActive,
        hadSubscription: purchase.hadSubscription,
        autoRenewWasOn: purchase.autoRenewWasOn,
      });
    }
  }, [
    analyticsSource,
    isTutor,
    openCheckout,
    purchase.autoRenewWasOn,
    purchase.currentPlan,
    purchase.hadSubscription,
    purchase.ready,
    purchase.wasActive,
    search.period,
  ]);

  if (!isTutor) return null;
  if (screen === 'checkout') return <SubscriptionCheckout />;
  if (screen === 'manage') return <SubscriptionManage />;

  return <SubscriptionOverview />;
};
