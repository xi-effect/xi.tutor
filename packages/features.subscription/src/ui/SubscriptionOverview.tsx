import { Button } from '@xipkg/button';
import { InfoCircle } from '@xipkg/icons';
import { Link } from '@xipkg/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { formatPlanStorage, useSubscriptionPlan } from 'common.subscription';
import { useCurrentSubscription, useStorageUsage } from 'common.services';
import { getAppLanguage } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { formatRenewalDateShort } from '../utils/dates';
import { UsageBar } from './UsageBar';

const SOVLIUM_PRICES_URL = 'https://sovlium.ru/prices';

const StorageInfoHint = () => {
  const { t } = useTranslation('subscription');

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex size-4 shrink-0 items-center justify-center"
            aria-label={t('overview.storageInfoLabel')}
          >
            <InfoCircle size="sm" theme="muted" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="z-[200] max-w-72 leading-5 font-normal"
        >
          {t('overview.storageInfo')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const SubscriptionOverview = () => {
  const { t } = useTranslation('subscription');
  const { planId, tariff, isPlanError, isPlanLoading, refetchPlan } = useSubscriptionPlan();
  const subscriptionQuery = useCurrentSubscription({ enabled: !isPlanLoading && !isPlanError });
  const storageQuery = useStorageUsage();

  if (isPlanLoading || !planId || !tariff) {
    if (isPlanError) {
      return (
        <div className="flex max-w-md flex-col gap-3">
          <p className="text-text-secondary text-sm">{t('overview.planError')}</p>
          <Button type="button" variant="primary" size="m" onClick={() => void refetchPlan()}>
            {t('overview.retry')}
          </Button>
        </div>
      );
    }

    return <p className="text-text-secondary text-sm">{t('overview.loading')}</p>;
  }

  const subscription = subscriptionQuery.data;
  const endsAt = subscription?.subscription.ends_at;
  const locale = getAppLanguage() === 'en' ? 'en-US' : 'ru-RU';

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-text-secondary text-sm">{t('overview.currentPlan')}</span>
            <span className="text-text-primary text-base font-semibold">
              {t(`plans.${planId}`)}
            </span>
          </div>
          {subscriptionQuery.isPending && subscriptionQuery.fetchStatus !== 'idle' ? (
            <span className="text-text-secondary text-sm">{t('overview.loading')}</span>
          ) : null}
          {subscriptionQuery.isError ? (
            <div className="flex flex-col items-start gap-2">
              <span className="text-text-secondary text-sm">{t('overview.subscriptionError')}</span>
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
          {endsAt ? (
            <span className="text-text-secondary text-sm">
              {t('overview.activeUntil', { date: formatRenewalDateShort(endsAt) })}
            </span>
          ) : null}
          {subscription ? (
            <span className="text-text-secondary text-sm">
              {subscription.auto_renewal ? t('manage.autoRenewOn') : t('manage.autoRenewOff')}
            </span>
          ) : null}
        </div>

        {storageQuery.isError ? (
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary text-sm">{t('overview.storageError')}</span>
            <Button
              type="button"
              variant="ghost"
              size="s"
              className="h-8 px-0"
              onClick={() => void storageQuery.refetch()}
            >
              {t('overview.retry')}
            </Button>
          </div>
        ) : storageQuery.data ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary flex items-center gap-1 text-sm">
                {t('overview.storage')}
                <StorageInfoHint />
              </span>
              <span className="text-text-primary text-sm font-medium">
                {t('overview.usage', {
                  used: formatPlanStorage(storageQuery.data.total_storage_bytes, planId, locale),
                  total: formatPlanStorage(tariff.storageBytes, planId, locale),
                })}
              </span>
            </div>
            <UsageBar used={storageQuery.data.total_storage_bytes} total={tariff.storageBytes} />
          </div>
        ) : (
          <span className="text-text-secondary text-sm">{t('overview.loading')}</span>
        )}
      </section>

      <section className="bg-background-subtle flex flex-col items-start gap-2 rounded-2xl px-4 py-3">
        <p className="text-text-secondary text-sm">{t('overview.plansDetails')}</p>
        <Link
          href={SOVLIUM_PRICES_URL}
          target="_blank"
          rel="noreferrer"
          size="s"
          className="text-text-link"
          data-umami-event="outbound-link-click"
          data-umami-event-url={SOVLIUM_PRICES_URL}
          data-umami-event-type="prices"
        >
          {t('overview.landing')}
        </Link>
      </section>
    </div>
  );
};
