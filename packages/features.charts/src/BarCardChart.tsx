import { ChevronUp } from '@xipkg/icons';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { type ChartConfig, ChartContainer } from './Chart';

type ChartDataItemT = {
  month: string;
  value: number;
};

type ChartBarT = {
  chartData: ChartDataItemT[];
  chartConfig: ChartConfig;
  fillBar: string;
  dataKey?: string;
};

export const BarCardChart = ({ chartData, chartConfig, fillBar, dataKey }: ChartBarT) => {
  return (
    <div className="h-[300px] w-[1000px]">
      <div className="rounded-lg border shadow-sm">
        <div className="flex justify-between space-y-1.5 p-6">
          <div className="text-primary-100 text-xl font-semibold tracking-tight">Доход</div>
          <div className="text-muted-foreground flex items-center text-xs">
            <span className="text-gray-60">Предмет: </span>
            <span className={'mr-1'}> Любой</span>
            <ChevronUp size={'sm'} />
          </div>
        </div>
        <div className="p-6 pt-0">
          <ChartContainer config={chartConfig} className="h-[260px] w-[892px]">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="h-4"
              />
              <Bar dataKey={dataKey || 'value'} fill={fillBar} radius={4} barSize={24} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};
