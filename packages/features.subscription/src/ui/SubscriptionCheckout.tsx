import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Checkbox } from '@xipkg/checkbox';
import {
  formatRub,
  SUBSCRIPTION_PROMO_ENABLED,
  TARIFFS,
  useSubscriptionUiStore,
} from 'common.subscription';
import { useCreateSubscriptionPayment } from 'common.services';
import { getAppLanguage } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { isConfirmationUrl } from '../pendingPayment';
import { PromoCodeField } from './PromoCodeField';
import { ScreenBackButton } from './ScreenBackButton';

export const SubscriptionCheckout = () => {
  const { t } = useTranslation('subscription');
  const locale = getAppLanguage() === 'en' ? 'en-US' : 'ru-RU';
  const [error, setError] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const price = TARIFFS.pro.priceMonthlyRub;
  const openOverview = useSubscriptionUiStore((state) => state.openOverview);
  const createPayment = useCreateSubscriptionPayment();

  const handlePay = async () => {
    setError(false);

    try {
      const payment = await createPayment.mutateAsync(autoRenewal);

      if (!isConfirmationUrl(payment.confirmation_url)) {
        setError(true);
        return;
      }

      window.location.assign(payment.confirmation_url);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <ScreenBackButton onClick={openOverview} />
      <span className="text-text-primary text-3xl font-semibold max-sm:hidden">
        {t('checkout.title')}
      </span>

      <section className="border-border-strong flex flex-col gap-3 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <span className="text-text-primary text-base font-semibold">{t('checkout.plan')}</span>
          <span className="text-text-primary text-sm font-medium">
            {t('checkout.periodPrice', { price: formatRub(price, locale) })}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary font-medium">{t('checkout.total')}</span>
          <span className="text-text-primary font-semibold">{formatRub(price, locale)}</span>
        </div>
      </section>

      {SUBSCRIPTION_PROMO_ENABLED ? <PromoCodeField /> : null}

      <div className="flex flex-col gap-1">
        <Checkbox
          size="s"
          checked={autoRenewal}
          onCheckedChange={(checked) => setAutoRenewal(checked === true)}
          className="items-center text-sm"
        >
          <span className="text-text-primary text-sm font-medium">{t('checkout.autoRenewal')}</span>
        </Checkbox>
        <div className="text-text-secondary flex flex-col gap-0.5 pl-5 text-xs leading-4">
          <p>{t('checkout.autoRenewalHint')}</p>
          <p>{t('checkout.autoRenewalManage')}</p>
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        size="m"
        className="h-12 w-full rounded-xl font-medium"
        onClick={() => void handlePay()}
        disabled={createPayment.isPending}
      >
        {t('checkout.pay')}
      </Button>
      {error ? (
        <p className="text-status-error-text text-center text-sm">{t('checkout.error')}</p>
      ) : null}
      <div className="text-text-secondary flex flex-col gap-1 text-center text-xs leading-4">
        <p>{t('checkout.paymentHint')}</p>
        {autoRenewal ? (
          <>
            <p>{t('checkout.paymentAutoChargeHint')}</p>
            <p>{t('checkout.paymentAutoChargeHintLine2')}</p>
          </>
        ) : null}
      </div>
    </div>
  );
};
