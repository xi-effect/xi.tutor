import { BarCardChart } from './BarCardChart';
import { PieCardChart } from './PieCardChart';
import { type ChartConfig } from './Chart';

const chartDataBarCardChart = [
  { month: 'Апрель', value: 20 },
  { month: 'Май', value: 100 },
  { month: 'Июнь', value: 200 },
  { month: 'Июль', value: 5 },
  { month: 'Август', value: 5 },
  { month: 'Сентябрь', value: 75 },
  { month: 'Октябрь', value: 200 },
  { month: 'Ноябрь', value: 200 },
  { month: 'Декабрь', value: 150 },
  { month: 'Январь', value: 200 },
  { month: 'Февраль', value: 200 },
  { month: 'Март', value: 200 },
];

const chartConfigBarCardChart = {
  value: {
    label: 'Доход',
    color: 'var(--xi-brand-80)',
  },
} satisfies ChartConfig;

const chartDataPieCardChart = [
  { language: 'english', visitors: 50, fill: 'var(--xi-brand-80)' },
  { language: 'spanish', visitors: 15, fill: 'var(--xi-brand-60)' },
  { language: 'italian', visitors: 35, fill: 'var(--xi-brand-40)' },
];

const chartConfigPieCardChart = {
  visitors: {
    label: 'Visitors',
  },
  english: {
    label: 'Английский язык',
    color: 'var(--xi-brand-80)',
  },
  spanish: {
    label: 'Испанский язык',
    color: 'var(--xi-brand-60)',
  },
  italian: {
    label: 'Итальянский язык',
    color: 'var(--xi-brand-40)',
  },
} satisfies ChartConfig;

export const PaymentControl = () => {
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
          pieCardTitle="Предметы"
        />
      </div>
    </div>
  );
};
