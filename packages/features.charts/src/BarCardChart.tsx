import { ChevronUp } from '@xipkg/icons';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { type ChartConfig, ChartContainer } from './Chart';
import { cn } from '@xipkg/utils';

type ChartDataItemT = {
  month: string;
  value: number;
};

type ChartBarT = {
  chartData: ChartDataItemT[];
  chartConfig: ChartConfig;
  fillBar: string;
  dataKey?: string;
  chartContainerProps?: {
    className?: string;
  };
  barChartProps?: {
    className?: string;
  };
  cartesianGridProps?: {
    className?: string;
  };
  xAxisProps?: {
    className?: string;
  };
  barProps?: {
    className?: string;
  };
};

export const BarCardChart = ({
  chartData,
  chartConfig,
  fillBar,
  dataKey,
  chartContainerProps,
  barChartProps,
  cartesianGridProps,
  xAxisProps,
  barProps,
}: ChartBarT) => {
  return (
    <div className="rounded-lg">
      <div className="flex justify-between space-y-1.5 p-4">
        <div className="text-primary-100 text-xl font-semibold tracking-tight">Доход</div>
        <div className="text-muted-foreground flex items-center text-xs">
          <span className="text-gray-60">Предмет: </span>
          <span className={'mr-1'}> Любой</span>
          <ChevronUp size={'sm'} />
        </div>
      </div>
      <div className="p-4 pt-0">
        <ChartContainer
          config={chartConfig}
          className={cn(chartContainerProps?.className, 'h-[216px] w-[892px]')}
          {...chartContainerProps}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            {...barChartProps}
            className={cn(barChartProps?.className)}
          >
            <CartesianGrid
              vertical={false}
              {...cartesianGridProps}
              className={cn(cartesianGridProps?.className)}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className={cn(xAxisProps?.className, 'h-4')}
              {...xAxisProps}
            />
            <Bar
              dataKey={dataKey || 'value'}
              fill={fillBar}
              radius={4}
              barSize={24}
              className={cn(barProps?.className)}
              {...barProps}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};
