import { useState } from 'react';
import { Button } from '@xipkg/button';
import {
  formatRub,
  TARIFFS,
  useSubscriptionStore,
  useSubscriptionUiStore,
} from 'common.subscription';
import { getAppLanguage } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { PromoCodeField } from './PromoCodeField';
import { ScreenBackButton } from './ScreenBackButton';

export const SubscriptionCheckout = () => {
  const { t } = useTranslation('subscription');
  const locale = getAppLanguage() === 'en' ? 'en-US' : 'ru-RU';
  const [pending, setPending] = useState(false);
  const price = TARIFFS.pro.priceMonthlyRub;
  const openOverview = useSubscriptionUiStore((s) => s.openOverview);
  const setPaymentResult = useSubscriptionUiStore((s) => s.setPaymentResult);
  const activatePro = useSubscriptionStore((s) => s.activatePro);
  const paymentOutcome = useSubscriptionStore((s) => s.mock.paymentOutcome);

  const handlePay = async () => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const outcome = useSubscriptionStore.getState().mock.paymentOutcome;
    setPending(false);

    if (outcome === 'cancel') {
      return;
    }

    if (outcome === 'success') {
      activatePro();
      setPaymentResult('success');
      return;
    }

    if (outcome === 'processing') {
      setPaymentResult('processing');
      return;
    }

    setPaymentResult('error');
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

      <PromoCodeField />

      <Button
        type="button"
        variant="primary"
        size="m"
        className="h-12 w-full rounded-xl font-medium"
        onClick={() => void handlePay()}
        disabled={pending}
      >
        {t('checkout.pay')}
      </Button>
      <p className="text-text-secondary text-center text-xs leading-4">
        {t('checkout.tochkaHint')}
      </p>
      {import.meta.env.DEV && paymentOutcome !== 'success' ? (
        <p className="text-text-muted text-center text-xs">mock: {paymentOutcome}</p>
      ) : null}
    </div>
  );
};
