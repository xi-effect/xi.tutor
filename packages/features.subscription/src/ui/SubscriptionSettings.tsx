import { useEffect, useRef } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useSubscriptionUiStore } from 'common.subscription';
import { readCheckoutPeriod, SubscriptionCheckout } from './SubscriptionCheckout';
import { SubscriptionManage } from './SubscriptionManage';
import { SubscriptionOverview } from './SubscriptionOverview';
import { SubscriptionResult } from './SubscriptionResult';

export const SubscriptionSettings = () => {
  const screen = useSubscriptionUiStore((state) => state.screen);
  const openCheckout = useSubscriptionUiStore((state) => state.openCheckout);
  const search = useSearch({ strict: false }) as { period?: string };
  const appliedPeriod = useRef<string | null>(null);

  useEffect(() => {
    const period = search.period;
    if (!period || appliedPeriod.current === period || !readCheckoutPeriod(period)) {
      return;
    }

    appliedPeriod.current = period;
    openCheckout();
  }, [openCheckout, search.period]);

  if (screen === 'checkout') return <SubscriptionCheckout />;
  if (screen === 'manage') return <SubscriptionManage />;
  if (screen === 'result') return <SubscriptionResult />;

  return <SubscriptionOverview />;
};
