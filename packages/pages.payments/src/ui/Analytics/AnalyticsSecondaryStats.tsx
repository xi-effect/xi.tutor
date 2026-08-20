import { formatMoney } from 'features.charts';
import { getDateLocale } from 'common.ui';
import { useTranslation } from 'react-i18next';
import type { AnalyticsSummaryT } from './types';

type AnalyticsSecondaryStatsProps = {
  summary: AnalyticsSummaryT;
};

export const AnalyticsSecondaryStats = ({ summary }: AnalyticsSecondaryStatsProps) => {
  const { t } = useTranslation('payments');
  const locale = getDateLocale();
  const averageCheck =
    summary.averageCheck == null
      ? t('analytics.emptyValue')
      : formatMoney(summary.averageCheck, locale);
  const paidShare =
    summary.paidRatio == null
      ? t('analytics.emptyValue')
      : t('analytics.secondary.paidShare', {
          paid: summary.paidCount,
          total: summary.invoicedCount,
        });

  return (
    <div className="bg-background-surface flex w-full flex-col gap-3 rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-s-base text-text-secondary">{t('analytics.secondary.title')}</p>
        <p className="text-text-primary text-lg font-medium tabular-nums">
          {formatMoney(summary.invoiced, locale)}
        </p>
      </div>
      <div className="text-s-base text-text-secondary flex flex-wrap gap-x-6 gap-y-1">
        <span>{paidShare}</span>
        <span>
          {t('analytics.secondary.averageCheck')}: {averageCheck}
        </span>
      </div>
    </div>
  );
};
