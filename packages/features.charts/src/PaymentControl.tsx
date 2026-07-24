import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarCardChart } from './BarCardChart';
import { PieCardChart } from './PieCardChart';
import { type ChartConfig } from './Chart';

export const PaymentControl = () => {
  const { t } = useTranslation('charts');

  const chartDataBarCardChart = useMemo(
    () => [
      { month: t('months.april'), value: 20 },
      { month: t('months.may'), value: 100 },
      { month: t('months.june'), value: 200 },
      { month: t('months.july'), value: 5 },
      { month: t('months.august'), value: 5 },
      { month: t('months.september'), value: 75 },
      { month: t('months.october'), value: 200 },
      { month: t('months.november'), value: 200 },
      { month: t('months.december'), value: 150 },
      { month: t('months.january'), value: 200 },
      { month: t('months.february'), value: 200 },
      { month: t('months.march'), value: 200 },
    ],
    [t],
  );

  const chartConfigBarCardChart = useMemo(
    () =>
      ({
        value: {
          label: t('income'),
          color: 'var(--xi-brand-80)',
        },
      }) satisfies ChartConfig,
    [t],
  );

  const chartDataPieCardChart = useMemo(
    () => [
      { language: 'english', visitors: 50, fill: 'var(--xi-brand-80)' },
      { language: 'spanish', visitors: 15, fill: 'var(--xi-brand-60)' },
      { language: 'italian', visitors: 35, fill: 'var(--xi-brand-40)' },
    ],
    [],
  );

  const chartConfigPieCardChart = useMemo(
    () =>
      ({
        visitors: {
          label: 'Visitors',
        },
        english: {
          label: t('languages.english'),
          color: 'var(--xi-brand-80)',
        },
        spanish: {
          label: t('languages.spanish'),
          color: 'var(--xi-brand-60)',
        },
        italian: {
          label: t('languages.italian'),
          color: 'var(--xi-brand-40)',
        },
      }) satisfies ChartConfig,
    [t],
  );

  return (
    <div className="flex gap-4">
      <div className="h-[292px] w-[924px]">
        <BarCardChart
          chartData={chartDataBarCardChart}
          chartConfig={chartConfigBarCardChart}
          fillBar="var(--xi-brand-80)"
          dataKey="value"
        />
      </div>
      <div className="h-[308px] w-[462px]">
        <PieCardChart
          chartData={chartDataPieCardChart}
          chartConfig={chartConfigPieCardChart}
          pieCardTitle={t('subjects')}
        />
      </div>
    </div>
  );
};
