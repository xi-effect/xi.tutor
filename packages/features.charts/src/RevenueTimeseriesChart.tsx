import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { cn } from '@xipkg/utils';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './Chart';
import { formatMoney, formatMoneyCompact } from './formatMoney';

export type RevenuePointT = {
  bucket: string;
  label: string;
  revenue: number;
  approximate?: number;
};

type RevenueTimeseriesChartProps = {
  data: RevenuePointT[];
  locale?: string;
  receivedLabel: string;
  emptyLabel: string;
  approximateLabel?: string;
  className?: string;
};

const BAR_POINT_LIMIT = 16;
const BRAND_FILL = 'var(--xi-brand-80)';
const TICK_FILL = 'var(--xi-text-secondary)';
const GRID_STROKE = 'var(--xi-border-default)';
const CHART_HEIGHT = 'h-[280px]';

export const RevenueTimeseriesChart = ({
  data,
  locale = 'ru-RU',
  receivedLabel,
  emptyLabel,
  approximateLabel,
  className,
}: RevenueTimeseriesChartProps) => {
  const chartConfig = {
    revenue: {
      label: receivedLabel,
      color: BRAND_FILL,
    },
  } satisfies ChartConfig;

  const useBar = data.length <= BAR_POINT_LIMIT;

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'text-text-secondary flex w-full items-center justify-center text-sm',
          CHART_HEIGHT,
          className,
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  const formatTick = (value: number) => formatMoneyCompact(value, locale);
  const ChartKind = useBar ? BarChart : LineChart;

  return (
    <ChartContainer config={chartConfig} className={cn(CHART_HEIGHT, 'w-full', className)}>
      <ChartKind
        accessibilityLayer
        data={data}
        margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
      >
        <CartesianGrid
          vertical={false}
          stroke={GRID_STROKE}
          strokeDasharray="4 4"
          className="stroke-border-default"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={useBar ? 16 : 40}
          interval={useBar ? 0 : 'equidistantPreserveStart'}
          tick={{ fill: TICK_FILL, fontSize: 12 }}
          className="text-text-secondary"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tickMargin={8}
          tickCount={5}
          domain={[0, 'auto']}
          tickFormatter={formatTick}
          tick={{ fill: TICK_FILL, fontSize: 12 }}
          className="text-text-secondary"
        />
        <ChartTooltip
          cursor={
            useBar
              ? { fill: 'var(--xi-gray-10)', opacity: 0.7 }
              : { stroke: GRID_STROKE, strokeWidth: 1 }
          }
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload as RevenuePointT | undefined;
                return point?.label ?? '';
              }}
              formatter={(value, _name, item) => {
                const point = item.payload as RevenuePointT;
                const approximate = point.approximate ?? 0;

                return (
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-text-secondary">{receivedLabel}</span>
                      <span className="text-text-primary font-medium tabular-nums">
                        {formatMoney(typeof value === 'number' ? value : 0, locale)}
                      </span>
                    </div>
                    {approximate > 0 && approximateLabel && (
                      <span className="text-text-secondary">
                        {approximateLabel}: {formatMoney(approximate, locale)}
                      </span>
                    )}
                  </div>
                );
              }}
            />
          }
        />
        {useBar ? (
          <Bar
            dataKey="revenue"
            name={receivedLabel}
            fill={BRAND_FILL}
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        ) : (
          <Line
            type="linear"
            dataKey="revenue"
            name={receivedLabel}
            stroke={BRAND_FILL}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: BRAND_FILL, strokeWidth: 0 }}
          />
        )}
      </ChartKind>
    </ChartContainer>
  );
};
