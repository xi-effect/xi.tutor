import { Button } from '@xipkg/button';
import { ChevronLeft, ChevronRight } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { DateTimeDisplay } from 'common.ui';
import { formatDateRange } from '../utils';

interface CalendarHeaderProps {
  /** Видимые дни расписания (то же, что отображается в канбане) */
  visibleDays: Date[];
  onPrev: () => void;
  onNext: () => void;
}

export const CalendarHeader = ({ visibleDays, onPrev, onNext }: CalendarHeaderProps) => {
  const { t } = useTranslation('calendar');

  const dateRangeLabel =
    visibleDays.length > 0 ? formatDateRange(visibleDays[0], visibleDays.length) : '';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 pt-6 pr-6 pb-4 pl-4">
      <DateTimeDisplay />
      <div className="flex items-center gap-2">
        <Button
          variant="none"
          size="s"
          className="rounded-md p-2 dark:text-gray-100"
          onClick={onPrev}
          aria-label={t('prev_week')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-l-base text-gray-90 min-w-[200px] text-center font-medium dark:text-gray-100">
          {dateRangeLabel}
        </span>
        <Button
          variant="none"
          size="s"
          className="rounded-md p-2 dark:text-gray-100"
          onClick={onNext}
          aria-label={t('next_week')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
