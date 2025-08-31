import { LabelList, Pie, PieChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './Chart';
import { cn } from '@xipkg/utils';
import type { PieChart as PieChartType, LabelList as LabelListType } from 'recharts';

type ChartDataItemT = {
  language: string;
  visitors: number;
  fill: string;
};

type PieCardChartT = {
  chartData: ChartDataItemT[];
  chartConfig: ChartConfig;
  pieChartProps?: Partial<Omit<React.ComponentProps<typeof PieChartType>, 'children'>> & {
    className?: string;
  };
  pieProps?: {
    className?: string;
  };
  chartContainerProps?: {
    className?: string;
  };
  chartTooltip?: {
    className?: string;
  };
  labelListProps?: Partial<Omit<React.ComponentProps<typeof LabelListType>, 'children'>> & {
    className?: string;
  };
  pieCardTitle: string;
};

export const PieCardChart = ({
  chartData,
  chartConfig,
  pieChartProps,
  pieProps,
  chartContainerProps,
  chartTooltip,
  labelListProps,
  pieCardTitle,
}: PieCardChartT) => {
  return (
    <div className="flex flex-col rounded-lg">
      <div className="flex space-y-1 p-4">
        <div className="text-primary-100 text-xl font-semibold tracking-tight dark:text-gray-100">
          {pieCardTitle}
        </div>
      </div>
      <div className="flex-1 p-4 pt-0 pb-0">
        <ChartContainer
          config={chartConfig}
          {...chartContainerProps}
          className={cn(chartContainerProps?.className, 'mx-auto aspect-square max-h-[200px]')}
        >
          <PieChart {...pieChartProps} className={cn(pieChartProps?.className)}>
            <ChartTooltip
              {...chartTooltip}
              cursor={false}
              content={<ChartTooltipContent hideLabel className={cn(chartTooltip?.className)} />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="language"
              innerRadius={60}
              outerRadius={100}
              {...pieProps}
              className={cn(pieProps?.className)}
            >
              <LabelList
                dataKey="visitors"
                className={(cn(labelListProps?.className), 'fill-gray-0 text-gray-60')}
                stroke="none"
                fontSize={12}
                position="inside"
                formatter={(value: number) => `${value}%`}
                {...labelListProps}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col items-center gap-2 p-4">
        <div className="flex items-center gap-4 text-xs">
          {Object.entries(chartConfig)
            .filter(([key]) => key !== 'visitors')
            .map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="flex h-4 w-4 items-center justify-center">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'color' in config ? config.color : undefined }}
                  />
                </div>
                <span className="dark:text-gray-100">{config.label}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
