import { useCallback } from 'react';
import { Button } from '@xipkg/button';
import { DatePicker } from '@xipkg/datepicker';
import { ArrowRight, Calendar, ArrowLeft, Plus } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { addDays } from 'date-fns';
import { DateTimeDisplay } from 'common.ui';
import { formatDateRangeDisplay } from '../utils';

export type CalendarWeekNavProps = {
  /** Начало текущей недели */
  weekStart: Date;
  /** Видимые дни расписания (то же, что отображается в канбане) */
  visibleDays: Date[];
  onPrev: () => void;
  onNext: () => void;
  /** Переход к выбранной в календаре неделе */
  onWeekSelect: (date: Date) => void;
};

/** Только блок «назад — диапазон дат — вперёд» (без даты/времени и без кнопки добавления) */
export const CalendarWeekNav = ({
  weekStart,
  visibleDays,
  onPrev,
  onNext,
  onWeekSelect,
}: CalendarWeekNavProps) => {
  const { t } = useTranslation('calendar');

  const visibleCount = visibleDays.length;
  const rangeEnd = visibleCount > 0 ? visibleDays[visibleCount - 1] : addDays(weekStart, 6);
  const dateRangeLabel = visibleCount > 0 ? formatDateRangeDisplay(weekStart, visibleCount) : '';

  const handleRangeSelect = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      const date = range?.from ?? range?.to;
      if (date) {
        onWeekSelect(date);
      }
    },
    [onWeekSelect],
  );

  return (
    <div className="flex h-8 flex-none flex-row items-center" style={{ flexGrow: 0 }}>
      <Button
        type="button"
        variant="text"
        className="bg-gray-0 border-gray-10 dark:border-gray-70 flex h-8 w-[60px] flex-none items-center justify-center rounded-l-lg rounded-r-none border border-r-0 p-0 dark:text-gray-100"
        onClick={onPrev}
        aria-label={t('prev_week')}
      >
        <ArrowLeft className="fill-gray-80 dark:fill-gray-90 h-5 w-5" />
      </Button>

      <DatePicker
        calendarProps={{
          mode: 'range',
          selected: { from: weekStart, to: rangeEnd },
          numberOfMonths: 2,
          onSelect: handleRangeSelect,
        }}
      >
        <button
          type="button"
          className="bg-gray-0 border-gray-10 dark:border-gray-70 flex h-8 flex-none flex-row items-center justify-center gap-3 border px-5 py-2 text-center font-medium dark:bg-transparent dark:text-gray-100"
        >
          <span className="text-xs-base text-gray-80 w-full">{dateRangeLabel}</span>
          <Calendar className="fill-brand-80 dark:fill-brand-80 h-5 w-5 flex-none" />
        </button>
      </DatePicker>

      <Button
        type="button"
        variant="text"
        className="bg-gray-0 border-gray-10 dark:border-gray-70 flex h-8 w-[60px] flex-none items-center justify-center rounded-l-none rounded-r-lg border border-l-0 p-0 dark:text-gray-100"
        onClick={onNext}
        aria-label={t('next_week')}
      >
        <ArrowRight className="fill-gray-80 dark:fill-gray-90 h-5 w-5" />
      </Button>
    </div>
  );
};

type CalendarHeaderProps = {
  /** Начало текущей недели */
  weekStart: Date;
  /** Видимые дни расписания (то же, что отображается в канбане) */
  visibleDays: Date[];
  onPrev: () => void;
  onNext: () => void;
  /** Переход к выбранной в календаре неделе */
  onWeekSelect: (date: Date) => void;
  /** Открытие модалки добавления занятия (кнопка «Добавить занятие») */
  onAddLessonClick?: () => void;
  /** Блок с текущими датой и временем слева в шапке (на вложенных экранах часто скрывают) */
  showDateTime?: boolean;
};

export const CalendarHeader = ({
  weekStart,
  visibleDays,
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
        visibleDays={visibleDays}
        onPrev={onPrev}
        onNext={onNext}
        onWeekSelect={onWeekSelect}
      />
      <div>
        <Button
          type="button"
          variant="ghost"
          size="s"
          className="text-s-base text-brand-80 h-[32px] font-medium"
          onClick={() => onAddLessonClick?.()}
        >
          Добавить занятие
          <Plus className="fill-brand-80 ml-3 h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
