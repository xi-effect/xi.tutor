import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { startOfWeek } from 'date-fns';
import { ScheduleWeekCarousel } from '../ScheduleWeekCarousel';
import { ScheduleDaySwiper } from '../ScheduleDaySwiper';
import { getWeeksRangeDays } from '../../../utils';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';

const getInitialWeekStart = () => startOfWeek(new Date(), { weekStartsOn: 1 });

type ScheduleMobileViewProps = {
  onAddLessonClick?: (date?: Date) => void;
};

/** Мобильный вид расписания в стиле iOS Calendar: карусель недель + свайп по дням */
export const ScheduleMobileView = ({ onAddLessonClick }: ScheduleMobileViewProps) => {
  const { t } = useTranslation('calendar');
  const [weekStart, setWeekStart] = useState<Date>(getInitialWeekStart);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  /** ~±26 недель от текущей недели — длинная лента дней для свайпа без упора в край */
  const slideDays = useMemo(() => getWeeksRangeDays(weekStart, 26, 26), [weekStart]);

  const handleWeekStartChange = useCallback((date: Date) => {
    setWeekStart(date);
    // selectedDate обновится через onSelectedDateChange из карусели
  }, []);

  const handleSelectedDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleAddLesson = useCallback(
    (date: Date) => {
      onAddLessonClick?.(date);
    },
    [onAddLessonClick],
  );

  return (
    <div className="bg-gray-5 flex min-h-0 flex-1 flex-col">
      <div className="bg-gray-5 sticky top-0 z-10 px-4 pt-4 pb-3">
        <div className="bg-gray-0 flex h-[184px] flex-col rounded-[20px] p-4">
          <div className="flex h-[32px] flex-row items-center justify-between gap-2">
            <span className="text-l-base font-medium text-gray-100">Расписание</span>
            <span className="text-s-base text-gray-60">Март</span>
          </div>
          <ScheduleWeekCarousel
            weekStart={weekStart}
            selectedDate={selectedDate}
            onWeekStartChange={handleWeekStartChange}
            onSelectedDateChange={handleSelectedDateChange}
          />
          <div>
            <Button
              variant="primary"
              size="s"
              className="flex w-full items-center justify-center gap-2"
              onClick={() => handleAddLesson(selectedDate)}
            >
              <Plus className="fill-gray-0 h-4 w-4 shrink-0" />
              {t('add_lesson')}
            </Button>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <ScheduleDaySwiper
          days={slideDays}
          selectedDate={selectedDate}
          onSelectedDateChange={handleSelectedDateChange}
          onAddLessonClick={handleAddLesson}
        />
      </div>
    </div>
  );
};
