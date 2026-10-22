import { Button } from '@xipkg/button';
import { useCanUseSubscriptionCommerce, useSubscriptionUiStore } from 'common.subscription';
import { useTranslation } from 'react-i18next';

export const PayAheadButton = () => {
  const { t } = useTranslation('subscription');
  const { allowed } = useCanUseSubscriptionCommerce();
  const openCheckout = useSubscriptionUiStore((state) => state.openCheckout);

  if (!allowed) return null;

  return (
    <div className="flex max-w-md flex-col gap-2">
      <Button
        type="button"
        variant="primary"
        size="m"
        className="h-12 w-full rounded-xl font-medium"
        onClick={openCheckout}
      >
        {t('overview.payNow')}
      </Button>
      <p className="text-text-secondary m-0 text-sm leading-5">{t('overview.payNowHint')}</p>
    </div>
  );
};
