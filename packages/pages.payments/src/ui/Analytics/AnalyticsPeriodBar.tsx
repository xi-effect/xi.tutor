import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { DatePicker } from '@xipkg/datepicker';
import { Calendar } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from 'common.ui';
import type { AnalyticsPeriodKind } from './types';

const PERIODS: AnalyticsPeriodKind[] = ['month', 'last_30_days', 'year', 'custom'];

const DATE_PICKER_POPOVER_CLASS =
  'dark:bg-background-surface border-border-default min-w-[280px] rounded-lg border p-0 shadow-lg';

const formatShortDate = (date: Date) =>
  date.toLocaleDateString(getDateLocale(), { day: 'numeric', month: 'short' });

type AnalyticsPeriodBarProps = {
  period: AnalyticsPeriodKind;
  onPeriodChange: (period: AnalyticsPeriodKind) => void;
  customFrom: Date;
  customTo: Date;
  onCustomFromChange: (date: Date) => void;
  onCustomToChange: (date: Date) => void;
};

export const AnalyticsPeriodBar = ({
  period,
  onPeriodChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: AnalyticsPeriodBarProps) => {
  const { t } = useTranslation('payments');

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="bg-background-subtle flex w-full flex-wrap gap-0.5 rounded-[10px] p-1 sm:w-auto">
        {PERIODS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPeriodChange(item)}
            className={cn(
              'text-s-base h-8 flex-1 rounded-lg px-3 font-medium transition-colors sm:flex-none',
              period === item
                ? 'bg-background-surface text-text-primary shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
                : 'text-text-secondary hover:text-text-primary',
            )}
            aria-pressed={period === item}
          >
            {t(`analytics.periods.${item}`)}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-2">
          <DatePicker
            calendarProps={{
              mode: 'single',
              selected: customFrom,
              onSelect: (date) => date && onCustomFromChange(date),
              required: true,
            }}
            classNamePopoverContent={DATE_PICKER_POPOVER_CLASS}
            popoverContentProps={{ side: 'bottom', align: 'start' }}
          >
            <Button
              type="button"
              variant="text"
              size="s"
              className="border-border-default hover:bg-background-page text-text-primary h-9 cursor-pointer gap-2 rounded-lg border bg-transparent px-3 text-sm font-medium normal-case"
            >
              {formatShortDate(customFrom)}
              <Calendar className="fill-icon-brand size-4 shrink-0" />
            </Button>
          </DatePicker>
          <span className="text-text-secondary text-sm">—</span>
          <DatePicker
            calendarProps={{
              mode: 'single',
              selected: customTo,
              onSelect: (date) => date && onCustomToChange(date),
              required: true,
            }}
            classNamePopoverContent={DATE_PICKER_POPOVER_CLASS}
            popoverContentProps={{ side: 'bottom', align: 'end' }}
          >
            <Button
              type="button"
              variant="text"
              size="s"
              className="border-border-default hover:bg-background-page text-text-primary h-9 cursor-pointer gap-2 rounded-lg border bg-transparent px-3 text-sm font-medium normal-case"
            >
              {formatShortDate(customTo)}
              <Calendar className="fill-icon-brand size-4 shrink-0" />
            </Button>
          </DatePicker>
        </div>
      )}
    </div>
  );
};
