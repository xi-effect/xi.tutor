import { Button } from '@xipkg/button';
import { ChevronLeft, ChevronRight } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { ScheduleKanban } from './components';
import { useCalendar } from '../hooks';
import { formatWeekRange } from '../utils';

export const CalendarModule = () => {
  const { t } = useTranslation('calendar');
  const { weekDays, weekStart, goToPrevWeek, goToNextWeek, goToToday } = useCalendar();

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4">
      <header className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="none"
            size="s"
            className="rounded-md p-2 dark:text-gray-100"
            onClick={goToPrevWeek}
            aria-label={t('prev_week')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-xl-base text-gray-90 min-w-[200px] text-center font-medium dark:text-gray-100">
            {formatWeekRange(weekStart)}
          </span>
          <Button
            variant="none"
            size="s"
            className="rounded-md p-2 dark:text-gray-100"
            onClick={goToNextWeek}
            aria-label={t('next_week')}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <Button
          variant="secondary"
          size="s"
          className="rounded-md border px-4 py-1.5 text-sm font-medium dark:text-gray-100"
          onClick={goToToday}
        >
          {t('today')}
        </Button>
      </header>
      <ScheduleKanban weekDays={weekDays} />
    </div>
  );
};
