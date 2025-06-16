import { BarCardChart } from '../src/BarCardChart';
import { PieCardChart } from '../src/PieCardChart';
import { type ChartConfig } from '../src/Chart';

const chartData = [
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

const chartConfig = {
  value: {
    label: 'Доход',
    color: 'var(--xi-brand-80)',
  },
} satisfies ChartConfig;

export const PaymentControl = () => {
  return (
    <div className="flex">
      <BarCardChart
        chartData={chartData}
        chartConfig={chartConfig}
        fillBar="var(--xi-brand-80)"
        dataKey="value"
      />
      <div className="h-[260px] w-[430px]">
        <PieCardChart />
      </div>
    </div>
  );
};
