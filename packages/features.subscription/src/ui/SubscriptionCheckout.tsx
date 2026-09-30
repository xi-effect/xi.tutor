import { useState } from 'react';
import { Button } from '@xipkg/button';
import {
  formatRub,
  SUBSCRIPTION_PROMO_ENABLED,
  TARIFFS,
  useSubscriptionUiStore,
} from 'common.subscription';
import { useCreateSubscriptionPayment, useCurrentSubscription } from 'common.services';
import { getAppLanguage } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { isConfirmationUrl, savePendingSubscriptionPayment } from '../pendingPayment';
import { PromoCodeField } from './PromoCodeField';
import { ScreenBackButton } from './ScreenBackButton';

export const SubscriptionCheckout = () => {
  const { t } = useTranslation('subscription');
  const locale = getAppLanguage() === 'en' ? 'en-US' : 'ru-RU';
  const [error, setError] = useState(false);
  const price = TARIFFS.pro.priceMonthlyRub;
  const openOverview = useSubscriptionUiStore((state) => state.openOverview);
  const subscriptionQuery = useCurrentSubscription();
  const createPayment = useCreateSubscriptionPayment();

  const payDisabled =
    createPayment.isPending ||
    subscriptionQuery.isPending ||
    subscriptionQuery.isError ||
    subscriptionQuery.isFetching;

  const handlePay = async () => {
    setError(false);

    try {
      const freshSubscription = await subscriptionQuery.refetch();
      if (freshSubscription.isError) {
        setError(true);
        return;
      }

      const result = await createPayment.mutateAsync();

      if (!isConfirmationUrl(result.confirmation_url)) {
        setError(true);
        return;
      }

      savePendingSubscriptionPayment({
        paymentId: result.payment.id,
        previousSubscriptionEndsAt: freshSubscription.data?.subscription.ends_at,
      });
      window.location.assign(result.confirmation_url);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="flex max-w-md flex-col gap-4">
      <ScreenBackButton onClick={openOverview} />
      <span className="text-text-primary text-3xl font-semibold max-sm:hidden">
        {t('checkout.title')}
      </span>

      <section className="border-border-strong flex flex-col gap-3 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <span className="text-text-primary text-base font-semibold">{t('checkout.plan')}</span>
          <span className="text-text-primary text-sm font-medium">
            {t('price.monthly', { price: formatRub(price, locale) })}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary font-medium">{t('checkout.total')}</span>
          <span className="text-text-primary font-semibold">{formatRub(price, locale)}</span>
        </div>
      </section>

      {SUBSCRIPTION_PROMO_ENABLED ? <PromoCodeField /> : null}

      {subscriptionQuery.isError ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-text-secondary text-sm">{t('overview.subscriptionError')}</p>
          <Button
            type="button"
            variant="ghost"
            size="s"
            className="h-8 px-0"
            onClick={() => void subscriptionQuery.refetch()}
          >
            {t('overview.retry')}
          </Button>
        </div>
      ) : null}

      <Button
        type="button"
        variant="primary"
        size="m"
        className="h-12 w-full rounded-xl font-medium"
        onClick={() => void handlePay()}
        disabled={payDisabled}
      >
        {t('checkout.pay')}
      </Button>
      {error ? (
        <p className="text-status-error-text text-center text-sm">{t('checkout.error')}</p>
      ) : null}
      <p className="text-text-secondary text-center text-xs leading-4">
        {t('checkout.paymentHint')}
      </p>
    </div>
  );
};
