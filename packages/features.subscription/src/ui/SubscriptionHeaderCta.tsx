import { Button } from '@xipkg/button';
import {
  SUBSCRIPTION_BILLING_ENABLED,
  useSubscriptionPlan,
  useSubscriptionUiStore,
} from 'common.subscription';
import { trackSubscriptionPlanSelected } from 'common.utils';
import { useTranslation } from 'react-i18next';
import { useSubscriptionPurchaseContext } from '../analytics';

export const SubscriptionHeaderCta = () => {
  const { t } = useTranslation('subscription');
  const { isPro, isPlanReady, isPlanError } = useSubscriptionPlan();
  const purchase = useSubscriptionPurchaseContext();
  const screen = useSubscriptionUiStore((s) => s.screen);
  const openCheckout = useSubscriptionUiStore((s) => s.openCheckout);
  const openManage = useSubscriptionUiStore((s) => s.openManage);

  if (!SUBSCRIPTION_BILLING_ENABLED || !isPlanReady || isPlanError || screen !== 'overview') {
    return null;
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="s"
      className="h-8 shrink-0 rounded-xl px-4 font-medium"
      onClick={() => {
        if (isPro) {
          openManage();
          return;
        }

        trackSubscriptionPlanSelected({
          source: purchase.source,
          currentPlan: purchase.currentPlan,
          targetPlan: 'pro',
          billingPeriod: 'month',
          wasActive: purchase.wasActive,
          hadSubscription: purchase.hadSubscription,
          autoRenewWasOn: purchase.autoRenewWasOn,
        });
        openCheckout();
      }}
    >
      {isPro ? t('overview.manage') : t('compare.cta')}
    </Button>
  );
};
