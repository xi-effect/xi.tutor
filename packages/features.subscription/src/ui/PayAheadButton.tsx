import { Button } from '@xipkg/button';
import { useSubscriptionUiStore } from 'common.subscription';
import { useTranslation } from 'react-i18next';

export const PayAheadButton = () => {
  const { t } = useTranslation('subscription');
  const openCheckout = useSubscriptionUiStore((state) => state.openCheckout);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2">
      <Button
        type="button"
        variant="primary"
        size="m"
        className="h-12 w-full rounded-xl font-medium"
        onClick={() => openCheckout()}
      >
        {t('overview.payNow')}
      </Button>
      <p className="text-text-secondary m-0 text-center text-sm leading-5">
        {t('overview.payNowHint')}
      </p>
    </div>
  );
};
