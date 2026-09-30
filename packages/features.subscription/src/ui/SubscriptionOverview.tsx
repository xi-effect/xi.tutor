import { Button } from '@xipkg/button';
import { formatBytes, useSubscriptionPlan } from 'common.subscription';
import { useCurrentSubscription, useStorageUsage } from 'common.services';
import { useTranslation } from 'react-i18next';
import { formatRenewalDateShort } from '../utils/dates';
import { TariffsCompareTable } from './TariffsCompare';
import { UsageBar } from './UsageBar';

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

  return (
    <div className="flex flex-col gap-6">
      <section className="border-border-strong flex flex-col gap-3 rounded-2xl border p-4">
        <div className="flex flex-col gap-1">
          <span className="text-text-secondary text-sm">{t('overview.currentPlan')}</span>
          <span className="text-text-primary text-base font-semibold">{t(`plans.${planId}`)}</span>
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
              <span className="text-text-secondary text-sm">{t('overview.storage')}</span>
              <span className="text-text-primary text-sm font-medium">
                {t('overview.usage', {
                  used: formatBytes(storageQuery.data.total_storage_bytes),
                  total: formatBytes(tariff.storageBytes),
                })}
              </span>
            </div>
            <UsageBar used={storageQuery.data.total_storage_bytes} total={tariff.storageBytes} />
          </div>
        ) : (
          <span className="text-text-secondary text-sm">{t('overview.loading')}</span>
        )}
      </section>

      <TariffsCompareTable />
    </div>
  );
};
