import { useSubscriptionUiStore } from 'common.subscription';
import { SubscriptionCheckout } from './SubscriptionCheckout';
import { SubscriptionManage } from './SubscriptionManage';
import { SubscriptionOverview } from './SubscriptionOverview';
import { SubscriptionResult } from './SubscriptionResult';

export const SubscriptionSettings = () => {
  const screen = useSubscriptionUiStore((state) => state.screen);

  if (screen === 'checkout') return <SubscriptionCheckout />;
  if (screen === 'manage') return <SubscriptionManage />;
  if (screen === 'result') return <SubscriptionResult />;

  return <SubscriptionOverview />;
};
