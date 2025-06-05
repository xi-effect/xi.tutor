'use client';

import { LabelList, Pie, PieChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './Chart';

const chartData = [
  { language: 'english', visitors: 50, fill: 'var(--xi-brand-80)' },
  { language: 'spanish', visitors: 15, fill: 'var(--xi-brand-60)' },
  { language: 'italian', visitors: 35, fill: 'var(--xi-brand-40)' },
];
const chartConfig = {
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

export const PieCardChart = () => {
  console.log('PieCardChart');

  return (
    <div className="bg-card text-card-foreground flex flex-col rounded-lg border shadow-sm">
      <div className="flex space-y-1 p-4">
        <div className="text-primary-100 text-xl font-semibold tracking-tight">Предметы</div>
      </div>
      <div className="flex-1 p-6 pt-0 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="language"
              innerRadius={60}
              outerRadius={100}
            >
              <LabelList
                dataKey="visitors"
                className="fill-gray-0 text-gray-60"
                stroke="none"
                fontSize={12}
                position="inside"
                formatter={(value: number) => `${value}%`}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col items-center gap-2 p-6 pt-0">
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
                <span>{config.label}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
