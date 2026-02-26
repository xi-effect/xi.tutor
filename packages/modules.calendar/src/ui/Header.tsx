import { Button } from '@xipkg/button';
import { ChevronLeft, ChevronRight } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { DateTimeDisplay } from 'common.ui';
import { useCalendar } from '../hooks';
import { formatDateRange } from '../utils';

interface CalendarHeaderProps {
  /** Количество видимых столбцов дней (из useKanbanColumns) */
  visibleCount: number;
}

export const CalendarHeader = ({ visibleCount }: CalendarHeaderProps) => {
  const { t } = useTranslation('calendar');
  const { weekStart, goToPrev, goToNext } = useCalendar();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 p-7">
      <DateTimeDisplay />
      <div className="flex items-center gap-2">
        <Button
          variant="none"
          size="s"
          className="rounded-md p-2 dark:text-gray-100"
          onClick={() => goToPrev(visibleCount)}
          aria-label={t('prev_week')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-l-base text-gray-90 min-w-[200px] text-center font-medium dark:text-gray-100">
          {formatDateRange(weekStart, visibleCount)}
        </span>
        <Button
          variant="none"
          size="s"
          className="rounded-md p-2 dark:text-gray-100"
          onClick={() => goToNext(visibleCount)}
          aria-label={t('next_week')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
