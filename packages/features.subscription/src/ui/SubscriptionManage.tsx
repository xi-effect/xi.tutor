import { Button } from '@xipkg/button';
import {
  formatRub,
  getRemainingSubscriptionDays,
  isSubscriptionPeriodActive,
  TARIFFS,
  useSubscriptionPlan,
  useSubscriptionUiStore,
} from 'common.subscription';
import { useCurrentSubscription } from 'common.services';
import { getAppLanguage, useAppTimeZone } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { formatRenewalDate } from '../utils/dates';
import { CancelSubscriptionButton } from './CancelSubscriptionButton';
import { ScreenBackButton } from './ScreenBackButton';

export const SubscriptionManage = () => {
  const { t } = useTranslation('subscription');
  useAppTimeZone();
  const locale = getAppLanguage() === 'en' ? 'en-US' : 'ru-RU';
  const { planId, tariff, isPlanError, refetchPlan } = useSubscriptionPlan();
  const subscriptionQuery = useCurrentSubscription();
  const openOverview = useSubscriptionUiStore((state) => state.openOverview);

  const price = t('price.monthly', {
    price: formatRub((tariff ?? TARIFFS.pro).priceMonthlyRub, locale),
  });
  const subscription = subscriptionQuery.data;
  const endsAt = subscription?.subscription.ends_at;
  const activeSubscription = isSubscriptionPeriodActive(endsAt) ? subscription : null;
  const activeEndsAt = activeSubscription?.subscription.ends_at;
  const autoRenew = Boolean(activeSubscription?.auto_renewal);
  const remainingDays = activeEndsAt ? getRemainingSubscriptionDays('pro', activeEndsAt) : 0;

  if (isPlanError || !planId) {
    return (
      <div className="flex max-w-md flex-col gap-3">
        <ScreenBackButton onClick={openOverview} />
        <p className="text-text-secondary text-sm">{t('overview.planError')}</p>
        <Button type="button" variant="primary" size="m" onClick={() => void refetchPlan()}>
          {t('overview.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ScreenBackButton onClick={openOverview} />
      <span className="text-text-primary text-3xl font-semibold max-sm:hidden">
        {t('manage.title')}
      </span>

      <section className="border-border-strong flex flex-col gap-3 rounded-2xl border p-4">
        <Row label={t('manage.plan')} value={t(`plans.${planId}`)} />
        <Row label={t('manage.price')} value={price} />
        {activeEndsAt ? (
          <Row
            label={autoRenew ? t('manage.nextRenewal') : t('overview.activeUntilLabel')}
            value={formatRenewalDate(activeEndsAt)}
          />
        ) : null}
        {activeEndsAt ? (
          <Row
            label={t('manage.daysLeftLabel')}
            value={t('manage.daysLeftValue', { count: remainingDays })}
          />
        ) : null}
        {activeSubscription ? (
          <Row label={autoRenew ? t('manage.autoRenewOn') : t('manage.autoRenewOff')} value="" />
        ) : null}
      </section>

      {subscriptionQuery.isPending && subscriptionQuery.fetchStatus !== 'idle' ? (
        <p className="text-text-secondary text-sm">{t('overview.loading')}</p>
      ) : null}

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

      <CancelSubscriptionButton buttonClassName="text-text-danger h-12 w-full rounded-xl" />
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-text-secondary text-sm">{label}</span>
    {value ? <span className="text-text-primary text-sm font-medium">{value}</span> : null}
  </div>
);
