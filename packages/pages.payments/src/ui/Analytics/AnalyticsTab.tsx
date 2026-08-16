import { useMemo, useState } from 'react';
import { cn, useMediaQuery } from '@xipkg/utils';
import { Toggle } from '@xipkg/toggle';
import { RevenueTimeseriesChart, formatMoney } from 'features.charts';
import { getDateLocale } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { AnalyticsPeriodBar } from './AnalyticsPeriodBar';
import { AnalyticsKpiRow } from './AnalyticsKpiRow';
import { AnalyticsSecondaryStats } from './AnalyticsSecondaryStats';
import { AnalyticsAttention } from './AnalyticsAttention';
import { AnalyticsEmptyState } from './AnalyticsEmptyState';
import { AnalyticsInvoicePreview } from './AnalyticsInvoicePreview';
import { getMockAnalyticsDashboard } from './mocks';
import type { AnalyticsAttentionItemT, AnalyticsPeriodKind } from './types';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const formatRangeLabel = (from: Date, to: Date, locale: string) => {
  const dayMonth = (date: Date) =>
    date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const sameYear = from.getFullYear() === to.getFullYear();
  const fromLabel = sameYear ? dayMonth(from) : `${dayMonth(from)} ${from.getFullYear()}`;
  const toLabel = `${dayMonth(to)} ${to.getFullYear()}`;
  return `${fromLabel} — ${toLabel}`;
};

export const AnalyticsTab = () => {
  const { t } = useTranslation('payments');
  const { t: tCharts } = useTranslation('charts');
  const locale = getDateLocale();
  const isMobile = useMediaQuery('(max-width: 960px)');
  const [period, setPeriod] = useState<AnalyticsPeriodKind>('month');
  const [customFrom, setCustomFrom] = useState(() => startOfMonth(new Date()));
  const [customTo, setCustomTo] = useState(() => new Date());
  const [previewItem, setPreviewItem] = useState<AnalyticsAttentionItemT | null>(null);
  const [compareEnabled, setCompareEnabled] = useState(true);

  const dashboard = getMockAnalyticsDashboard(period);

  const series = useMemo(() => {
    if (period !== 'year') return dashboard.series;

    return dashboard.series.map((point) => {
      const monthKey = point.bucket.slice(5);
      return {
        ...point,
        label: t(`analytics.monthsShort.${monthKey}`),
      };
    });
  }, [dashboard.series, period, t]);

  const canCompare = series.some((point) => (point.previousRevenue ?? 0) > 0);

  const periodLabels = useMemo(() => {
    if (period !== 'custom') {
      return {
        current: dashboard.periodLabel,
        previous: dashboard.previousPeriodLabel,
      };
    }

    const from = startOfDay(customFrom);
    const to = startOfDay(customTo);
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / MS_PER_DAY) + 1);
    const prevTo = new Date(from.getTime() - MS_PER_DAY);
    const prevFrom = new Date(prevTo.getTime() - (days - 1) * MS_PER_DAY);

    return {
      current: formatRangeLabel(from, to, locale),
      previous: formatRangeLabel(prevFrom, prevTo, locale),
    };
  }, [customFrom, customTo, dashboard.periodLabel, dashboard.previousPeriodLabel, locale, period]);

  const handleCustomFromChange = (date: Date) => {
    const nextFrom = startOfDay(date);
    setCustomFrom(nextFrom);
    if (nextFrom > startOfDay(customTo)) {
      setCustomTo(nextFrom);
    }
  };

  const handleCustomToChange = (date: Date) => {
    const nextTo = startOfDay(date);
    setCustomTo(nextTo);
    if (nextTo < startOfDay(customFrom)) {
      setCustomFrom(nextTo);
    }
  };

  if (!dashboard.hasAnyInvoices) {
    return <AnalyticsEmptyState />;
  }

  return (
    <div
      className={cn(
        'min-h-0 w-full flex-1 overflow-auto pr-5',
        isMobile ? 'h-[calc(100dvh-204px)]' : 'h-[calc(100dvh-190px)]',
      )}
    >
      <div className="flex w-full min-w-0 flex-col gap-5 pb-10">
        <AnalyticsPeriodBar
          period={period}
          onPeriodChange={setPeriod}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={handleCustomFromChange}
          onCustomToChange={handleCustomToChange}
        />

        <AnalyticsKpiRow summary={dashboard} />
        <AnalyticsSecondaryStats summary={dashboard} />

        <section className="bg-background-surface flex w-full flex-col gap-4 rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-l-base text-text-primary font-medium">
                {t('analytics.chart.title')}
              </h2>
              <p className="text-s-base text-text-secondary">
                {t('analytics.chart.subtitle', { current: periodLabels.current })}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {canCompare && (
                <div className="flex items-center gap-2">
                  <Toggle
                    id="analytics-compare"
                    size="s"
                    checked={compareEnabled}
                    onCheckedChange={(checked) => setCompareEnabled(checked === true)}
                  />
                  <label
                    htmlFor="analytics-compare"
                    className="text-s-base text-text-primary cursor-pointer select-none"
                  >
                    {t('analytics.chart.compare')}
                  </label>
                </div>
              )}
              {dashboard.approximateRevenue > 0 && (
                <p className="text-xs-base text-text-secondary max-w-sm sm:text-right">
                  {t('analytics.chart.approximate', {
                    amount: formatMoney(dashboard.approximateRevenue, locale),
                  })}
                </p>
              )}
            </div>
          </div>
          <RevenueTimeseriesChart
            key={period}
            data={series}
            locale={locale}
            receivedLabel={periodLabels.current}
            previousLabel={periodLabels.previous}
            showPrevious={compareEnabled}
            emptyLabel={tCharts('empty')}
            approximateLabel={tCharts('approximate')}
          />
        </section>

        <AnalyticsAttention items={dashboard.attention} onOpenInvoice={setPreviewItem} />
      </div>

      <AnalyticsInvoicePreview
        item={previewItem}
        open={previewItem != null}
        onOpenChange={(open) => {
          if (!open) setPreviewItem(null);
        }}
      />
    </div>
  );
};
