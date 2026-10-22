import { useEffect, useState } from 'react';
import { Button } from '@xipkg/button';
import { Checkbox } from '@xipkg/checkbox';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { useSearch } from '@tanstack/react-router';
import {
  formatRub,
  TARIFFS,
  useCanUseSubscriptionCommerce,
  useSubscriptionUiStore,
} from 'common.subscription';
import { useCreateSubscriptionPayment } from 'common.services';
import { getAppLanguage } from 'common.ui';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import { useTranslation } from 'react-i18next';
import { isConfirmationUrl } from '../pendingPayment';
import { ScreenBackButton } from './ScreenBackButton';

type CheckoutPeriod = 'monthly' | 'yearly';

const PERIOD_DAYS: Record<CheckoutPeriod, number> = {
  monthly: 30,
  yearly: 360,
};

const PRICE_MORPH_TRANSITION = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 34,
  mass: 0.8,
};

export const readCheckoutPeriod = (period: string | undefined): CheckoutPeriod | null => {
  if (period === 'year' || period === 'yearly') return 'yearly';
  if (period === 'month' || period === 'monthly') return 'monthly';
  return null;
};

const MorphingPrice = ({
  value,
  locale,
  className,
}: {
  value: number;
  locale: string;
  className: string;
}) => {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const [displayed, setDisplayed] = useState(() => formatRub(value, locale));

  useMotionValueEvent(motionValue, 'change', (latest) => {
    setDisplayed(formatRub(Math.round(latest), locale));
  });

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);
      setDisplayed(formatRub(value, locale));
      return;
    }

    const controls = animate(motionValue, value, PRICE_MORPH_TRANSITION);
    return () => controls.stop();
  }, [locale, motionValue, reduceMotion, value]);

  return (
    <motion.span layout="size" transition={PRICE_MORPH_TRANSITION} className={className}>
      {displayed}
    </motion.span>
  );
};

export const SubscriptionCheckout = () => {
  const { t } = useTranslation('subscription');
  const locale = getAppLanguage() === 'en' ? 'en-US' : 'ru-RU';
  const search = useSearch({ strict: false }) as { period?: string };
  const [error, setError] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [period, setPeriod] = useState<CheckoutPeriod>(
    () => readCheckoutPeriod(search.period) ?? 'monthly',
  );

  useEffect(() => {
    const fromSearch = readCheckoutPeriod(search.period);
    if (fromSearch) setPeriod(fromSearch);
  }, [search.period]);

  const price = period === 'yearly' ? TARIFFS.pro.priceYearlyRub : TARIFFS.pro.priceMonthlyRub;
  const days = PERIOD_DAYS[period];
  const openOverview = useSubscriptionUiStore((state) => state.openOverview);
  const { allowed, isReady } = useCanUseSubscriptionCommerce();
  const createPayment = useCreateSubscriptionPayment();
  const formattedPrice = formatRub(price, locale);

  useEffect(() => {
    if (isReady && !allowed) openOverview();
  }, [allowed, isReady, openOverview]);

  const handlePay = async () => {
    if (!allowed) return;
    setError(false);

    try {
      const payment = await createPayment.mutateAsync({
        period,
        should_auto_renew: autoRenewal,
      });

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
    <div className="mx-auto flex h-full w-full max-w-md flex-col gap-4">
      <ScreenBackButton onClick={openOverview} />
      <span className="text-text-primary text-3xl font-semibold max-sm:hidden">
        {t('checkout.title')}
      </span>

      <SwitcherAnimate
        layoutId="subscription-checkout-period"
        tabs={[
          { id: 'monthly', label: t('checkout.periodMonth') },
          { id: 'yearly', label: t('checkout.periodYear') },
        ]}
        activeTab={period}
        onChange={(tabId) => setPeriod(tabId === 'yearly' ? 'yearly' : 'monthly')}
        className="bg-background-subtle h-9 w-full gap-0.5 rounded-[10px] p-1"
        tabClassName="h-7 flex-1 rounded-lg px-2 py-1 text-sm font-medium data-[state=inactive]:text-text-secondary data-[state=active]:text-text-primary data-[state=active]:hover:text-text-primary"
        indicatorClassName="rounded-lg border-0 bg-background-surface shadow-sm"
      />

      <section className="border-border-strong flex flex-col gap-3 rounded-2xl border p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-primary text-base font-semibold">{t('checkout.plan')}</span>
          <span className="text-text-primary inline-flex items-baseline gap-1 text-sm font-medium">
            <MorphingPrice value={price} locale={locale} className="tabular-nums" />
            <span>{t('checkout.periodSuffix', { days })}</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary font-medium">{t('checkout.total')}</span>
          <MorphingPrice
            value={price}
            locale={locale}
            className="text-text-primary font-semibold tabular-nums"
          />
        </div>
      </section>

      <Checkbox
        size="s"
        checked={autoRenewal}
        onCheckedChange={(checked) => setAutoRenewal(checked === true)}
        className="w-full items-center gap-2"
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-text-primary text-sm leading-4 font-medium">
            {t('checkout.autoRenewal')}
          </span>
          <span className="text-text-secondary text-xs leading-4 font-normal">
            {t('checkout.autoRenewalHint', { price: formattedPrice, days })}
          </span>
        </span>
      </Checkbox>

      <Button
        type="button"
        variant="primary"
        size="m"
        className="h-12 w-full rounded-xl font-medium"
        onClick={() => void handlePay()}
        disabled={!allowed || createPayment.isPending}
      >
        {t('checkout.pay')}
      </Button>
      {error ? (
        <p className="text-status-error-text text-center text-sm">{t('checkout.error')}</p>
      ) : null}
      <div className="text-text-secondary flex flex-col gap-1 text-center text-xs leading-4">
        <p>{t('checkout.paymentHint')}</p>
        <p>{t('checkout.autoRenewalManage')}</p>
      </div>
      <p className="text-text-secondary mt-auto pt-4 text-center text-xs leading-4">
        {t('checkout.yearlyDiscountNote')}
      </p>
    </div>
  );
};
