import { useEffect, useRef } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useCurrentUser } from 'common.services';
import { useSubscriptionUiStore } from 'common.subscription';
import { readCheckoutPeriod, SubscriptionCheckout } from './SubscriptionCheckout';
import { SubscriptionManage } from './SubscriptionManage';
import { SubscriptionOverview } from './SubscriptionOverview';

export const SubscriptionSettings = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const screen = useSubscriptionUiStore((state) => state.screen);
  const openCheckout = useSubscriptionUiStore((state) => state.openCheckout);
  const search = useSearch({ strict: false }) as { period?: string };
  const appliedPeriod = useRef<string | null>(null);

  useEffect(() => {
    const period = search.period;
    if (!isTutor || !period || appliedPeriod.current === period || !readCheckoutPeriod(period)) {
      return;
    }

    appliedPeriod.current = period;
    openCheckout();
  }, [isTutor, openCheckout, search.period]);

  if (!isTutor) return null;
  if (screen === 'checkout') return <SubscriptionCheckout />;
  if (screen === 'manage') return <SubscriptionManage />;

  return <SubscriptionOverview />;
};
