import { formatMoney } from 'features.charts';
import { getDateLocale } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { AnalyticsKpiCard } from './AnalyticsKpiCard';
import type { AnalyticsSummaryT } from './types';

type AnalyticsKpiRowProps = {
  summary: AnalyticsSummaryT;
};

export const AnalyticsKpiRow = ({ summary }: AnalyticsKpiRowProps) => {
  const { t } = useTranslation('payments');
  const locale = getDateLocale();
  const received = summary.received.current ?? 0;

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AnalyticsKpiCard
        title={t('analytics.kpi.received')}
        hint={t('analytics.hints.forPeriod')}
        value={formatMoney(received, locale)}
        deltaAbs={summary.received.deltaAbs}
        deltaRatio={summary.received.deltaRatio}
        deltaKind={summary.received.deltaKind}
        showDelta
      />
      <AnalyticsKpiCard
        title={t('analytics.kpi.awaitingPayment')}
        hint={t('analytics.hints.now')}
        value={formatMoney(summary.awaitingPayment.amount, locale)}
        caption={t('analytics.kpi.invoicesCount', { count: summary.awaitingPayment.count })}
      />
      <AnalyticsKpiCard
        title={t('analytics.kpi.awaitingConfirmation')}
        hint={t('analytics.hints.now')}
        value={formatMoney(summary.awaitingConfirmation.amount, locale)}
        caption={t('analytics.kpi.invoicesCount', { count: summary.awaitingConfirmation.count })}
      />
      <AnalyticsKpiCard
        title={t('analytics.kpi.openStudents')}
        hint={t('analytics.hints.now')}
        value={t('analytics.kpi.openStudentsValue', { count: summary.studentsWithOpenInvoices })}
      />
    </div>
  );
};
