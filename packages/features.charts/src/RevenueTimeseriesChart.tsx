import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { cn } from '@xipkg/utils';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './Chart';
import { formatMoney, formatMoneyCompact } from './formatMoney';

export type RevenuePointT = {
  bucket: string;
  label: string;
  revenue: number;
  previousRevenue?: number;
  approximate?: number;
};

type RevenueTimeseriesChartProps = {
  data: RevenuePointT[];
  locale?: string;
  receivedLabel: string;
  previousLabel?: string;
  showPrevious?: boolean;
  emptyLabel: string;
  approximateLabel?: string;
  className?: string;
};

const BAR_POINT_LIMIT = 32;
const BRAND_FILL = 'var(--xi-brand-80)';
const PREVIOUS_FILL = 'color-mix(in srgb, var(--xi-brand-80) 28%, transparent)';

export const RevenueTimeseriesChart = ({
  data,
  locale = 'ru-RU',
  receivedLabel,
  previousLabel,
  showPrevious = true,
  emptyLabel,
  approximateLabel,
  className,
}: RevenueTimeseriesChartProps) => {
  const hasPrevious = Boolean(
    showPrevious && previousLabel && data.some((point) => (point.previousRevenue ?? 0) > 0),
  );

  const chartConfig = {
    previousRevenue: {
      label: previousLabel || receivedLabel,
      color: PREVIOUS_FILL,
    },
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
          'text-text-secondary flex h-[280px] w-full items-center justify-center text-sm',
          className,
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  const formatTick = (value: number) => formatMoneyCompact(value, locale);
  const ChartKind = useBar ? BarChart : LineChart;
  const barSize = hasPrevious ? 40 : 56;

  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-3', className)}>
      {hasPrevious && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <LegendSwatch color={BRAND_FILL} label={receivedLabel} />
          <LegendSwatch color={PREVIOUS_FILL} label={previousLabel!} />
        </div>
      )}
      <ChartContainer config={chartConfig} className="h-[280px] w-full min-w-0">
        <ChartKind
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 16 }}
        >
          <CartesianGrid vertical={false} className="stroke-border-default" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={24}
            interval="preserveStartEnd"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-text-secondary"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tickMargin={8}
            tickFormatter={formatTick}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-text-secondary"
          />
          <ChartTooltip
            cursor={{ fill: 'var(--xi-gray-10, #f4f4f4)', opacity: 0.6 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as RevenuePointT | undefined;
                  return point?.label ?? '';
                }}
                formatter={(value, name, item) => {
                  const point = item.payload as RevenuePointT;
                  const isPrevious = name === 'previousRevenue' || name === previousLabel;
                  const label = isPrevious ? previousLabel : receivedLabel;
                  const approximate = !isPrevious ? (point.approximate ?? 0) : 0;

                  return (
                    <div className="flex w-full flex-col gap-1">
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-text-secondary">{label}</span>
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
            <>
              {hasPrevious && (
                <Bar
                  dataKey="previousRevenue"
                  name={previousLabel}
                  fill={PREVIOUS_FILL}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={barSize}
                  isAnimationActive={false}
                />
              )}
              <Bar
                dataKey="revenue"
                name={receivedLabel}
                fill={BRAND_FILL}
                radius={[6, 6, 0, 0]}
                maxBarSize={barSize}
                isAnimationActive={false}
              />
            </>
          ) : (
            <>
              {hasPrevious && (
                <Line
                  type="monotone"
                  dataKey="previousRevenue"
                  name={previousLabel}
                  stroke={PREVIOUS_FILL}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              <Line
                type="monotone"
                dataKey="revenue"
                name={receivedLabel}
                stroke={BRAND_FILL}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: BRAND_FILL }}
                isAnimationActive={false}
              />
            </>
          )}
        </ChartKind>
      </ChartContainer>
    </div>
  );
};

const LegendSwatch = ({ color, label }: { color: string; label: string }) => (
  <span className="text-xs-base text-text-secondary flex items-center gap-2">
    <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: color }} />
    {label}
  </span>
);
