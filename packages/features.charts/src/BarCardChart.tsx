import { ChevronUp } from '@xipkg/icons';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('charts');

  return (
    <div className="rounded-lg">
      <div className="flex justify-between space-y-1.5 p-4">
        <div className="text-primary-100 dark:text-text-primary text-xl font-semibold tracking-tight">
          {t('income')}
        </div>
        <div className="text-muted-foreground flex items-center text-xs">
          <span className="text-text-secondary">{t('subject')} </span>
          <span className={'dark:text-text-primary mr-1'}> {t('any')}</span>
          <ChevronUp size={'sm'} className="dark:fill-icon-primary h-6 w-6" />
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
            className={cn(barChartProps?.className, 'dark:text-text-primary')}
          >
            <CartesianGrid
              vertical={false}
              {...cartesianGridProps}
              className={cn(cartesianGridProps?.className, 'dark:text-text-primary')}
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
              className={cn(barProps?.className, 'dark:text-text-primary')}
              {...barProps}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};
