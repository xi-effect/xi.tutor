import { Button } from '@xipkg/button';
import {
  SUBSCRIPTION_BILLING_ENABLED,
  useSubscriptionPlan,
  useSubscriptionUiStore,
} from 'common.subscription';
import { useTranslation } from 'react-i18next';

export const SubscriptionHeaderCta = () => {
  const { t } = useTranslation('subscription');
  const { isPro } = useSubscriptionPlan();
  const screen = useSubscriptionUiStore((s) => s.screen);
  const openCheckout = useSubscriptionUiStore((s) => s.openCheckout);
  const openManage = useSubscriptionUiStore((s) => s.openManage);

  if (!SUBSCRIPTION_BILLING_ENABLED || screen !== 'overview') return null;

  return (
    <Button
      type="button"
      variant="primary"
      size="s"
      className="h-8 shrink-0 rounded-xl px-4 font-medium"
      onClick={() => (isPro ? openManage() : openCheckout())}
    >
      {isPro ? t('overview.manage') : t('compare.cta')}
    </Button>
  );
};
