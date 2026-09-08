import { Button } from '@xipkg/button';
import { useSubscriptionUiStore } from 'common.subscription';
import { useTranslation } from 'react-i18next';

export const SubscriptionResult = () => {
  const { t } = useTranslation('subscription');
  const paymentResult = useSubscriptionUiStore((s) => s.paymentResult);
  const openOverview = useSubscriptionUiStore((s) => s.openOverview);
  const openCheckout = useSubscriptionUiStore((s) => s.openCheckout);

  const status = paymentResult ?? 'error';

  return (
    <div className="flex max-w-md flex-col gap-4">
      <span className="text-text-primary text-3xl font-semibold">{t(`result.${status}Title`)}</span>
      <p className="text-text-secondary text-sm">{t(`result.${status}Text`)}</p>

      {status === 'success' ? (
        <Button
          type="button"
          variant="primary"
          size="m"
          className="h-12 rounded-xl font-medium"
          onClick={openOverview}
        >
          {t('result.done')}
        </Button>
      ) : null}

      {status === 'error' ? (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="primary"
            size="m"
            className="h-12 rounded-xl font-medium"
            onClick={openCheckout}
          >
            {t('result.retry')}
          </Button>
          <Button type="button" variant="ghost" size="m" onClick={openOverview}>
            {t('result.back')}
          </Button>
        </div>
      ) : null}

      {status === 'processing' ? (
        <Button type="button" variant="ghost" size="m" onClick={openOverview}>
          {t('result.done')}
        </Button>
      ) : null}
    </div>
  );
};
