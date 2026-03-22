import { useCallback, useMemo, useState } from 'react';
import { startOfWeek } from 'date-fns';
import { ScheduleWeekCarousel } from '../ScheduleWeekCarousel';
import { ScheduleDaySwiper } from '../ScheduleDaySwiper';
import { getWeeksRangeDays } from '../../../utils';
import { Button } from '@xipkg/button';
import { Calendar } from '@xipkg/icons';

const getInitialWeekStart = () => startOfWeek(new Date(), { weekStartsOn: 1 });

type ScheduleMobileViewProps = {
  onAddLessonClick?: (date?: Date) => void;
};

/** Мобильный вид расписания в стиле iOS Calendar: карусель недель + свайп по дням */
export const ScheduleMobileView = ({ onAddLessonClick }: ScheduleMobileViewProps) => {
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
    <div className="bg-gray-5 flex h-full min-h-0 flex-1 flex-col p-4">
      <div className="bg-gray-0 flex h-[184px] shrink-0 flex-col rounded-[20px] p-4">
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
            variant="none"
            className="bg-gray-5 text-gray-70 hover:bg-gray-10 hover:text-gray-80 h-[32px] w-full"
          >
            Выбрать дату
            <Calendar className="fill-gray-70 ml-3.5 h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
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
