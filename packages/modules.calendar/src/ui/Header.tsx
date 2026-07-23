import { useCallback } from 'react';
import { Button } from '@xipkg/button';
import { DatePicker } from '@xipkg/datepicker';
import { ArrowRight, Calendar, ArrowLeft, Plus } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { addDays, startOfDay } from 'date-fns';
import { DateTimeDisplay } from 'common.ui';
import { formatDateRangeDisplay } from '../utils';

export type CalendarWeekNavProps = {
  /** Начало видимого окна расписания */
  weekStart: Date;
  /** Число видимых колонок канбана (1–7) */
  visibleDayCount: number;
  onPrev: () => void;
  onNext: () => void;
  /** Переход к дате: выбранный день — по центру видимого окна */
  onWeekSelect: (date: Date, visibleCount: number) => void;
};

/** Блок «назад — диапазон дат — вперёд» */
export const CalendarWeekNav = ({
  weekStart,
  visibleDayCount,
  onPrev,
  onNext,
  onWeekSelect,
}: CalendarWeekNavProps) => {
  const { t } = useTranslation('calendar');

  const dayCount = Math.max(1, Math.min(7, visibleDayCount));
  const rangeEnd = addDays(weekStart, dayCount - 1);
  const dateRangeLabel = formatDateRangeDisplay(weekStart, dayCount);

  const handleRangeSelect = useCallback(
    (_range: { from?: Date; to?: Date } | undefined, triggerDate?: Date) => {
      if (!triggerDate) return;
      onWeekSelect(startOfDay(triggerDate), dayCount);
    },
    [dayCount, onWeekSelect],
  );

  return (
    <div className="flex h-8 flex-none flex-row items-center" style={{ flexGrow: 0 }}>
      <Button
        type="button"
        variant="text"
        className="bg-background-surface border-border-default dark:border-border-strong dark:text-text-primary flex h-8 w-[60px] flex-none items-center justify-center rounded-l-lg rounded-r-none border border-r-0 p-0"
        onClick={onPrev}
        aria-label={t('prev_week')}
        data-umami-event="schedule-prev-week"
      >
        <ArrowLeft className="fill-icon-primary dark:fill-icon-primary h-5 w-5" />
      </Button>

      <DatePicker
        calendarProps={{
          mode: 'range',
          selected: { from: weekStart, to: rangeEnd },
          numberOfMonths: 2,
          resetOnSelect: true,
          required: true,
          onSelect: handleRangeSelect,
        }}
      >
        <button
          type="button"
          className="bg-background-surface border-border-default dark:border-border-strong dark:text-text-primary flex h-8 flex-none flex-row items-center justify-center gap-3 border px-5 py-2 text-center font-medium dark:bg-transparent"
          data-umami-event="schedule-week-picker"
        >
          <span className="text-xs-base text-text-primary w-full">{dateRangeLabel}</span>
          <Calendar className="fill-icon-brand dark:fill-icon-brand h-5 w-5 flex-none" />
        </button>
      </DatePicker>

      <Button
        type="button"
        variant="text"
        className="bg-background-surface border-border-default dark:border-border-strong dark:text-text-primary flex h-8 w-[60px] flex-none items-center justify-center rounded-l-none rounded-r-lg border border-l-0 p-0"
        onClick={onNext}
        aria-label={t('next_week')}
        data-umami-event="schedule-next-week"
      >
        <ArrowRight className="fill-icon-primary dark:fill-icon-primary h-5 w-5" />
      </Button>
    </div>
  );
};

type CalendarHeaderProps = {
  weekStart: Date;
  visibleDayCount: number;
  onPrev: () => void;
  onNext: () => void;
  onWeekSelect: (date: Date, visibleCount: number) => void;
  onAddLessonClick?: () => void;
  showDateTime?: boolean;
};

export const CalendarHeader = ({
  weekStart,
  visibleDayCount,
  onPrev,
  onNext,
  onWeekSelect,
  onAddLessonClick,
  showDateTime = true,
}: CalendarHeaderProps) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 pt-5 pr-5 pb-5 pl-1">
      {showDateTime ? <DateTimeDisplay /> : null}
      <CalendarWeekNav
        weekStart={weekStart}
        visibleDayCount={visibleDayCount}
        onPrev={onPrev}
        onNext={onNext}
        onWeekSelect={onWeekSelect}
      />
      {onAddLessonClick ? (
        <div>
          <Button
            type="button"
            variant="primary"
            size="s"
            className="h-[32px] font-medium"
            onClick={() => onAddLessonClick()}
            data-umami-event="schedule-add-lesson"
          >
            Добавить занятие
            <Plus className="fill-text-on-accent ml-3 h-5 w-5" />
          </Button>
        </div>
      ) : null}
    </header>
  );
};
