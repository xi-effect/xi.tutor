import { useCallback, useMemo, useState } from 'react';
import { startOfWeek } from 'date-fns';
import { ScheduleWeekCarousel } from '../ScheduleWeekCarousel';
import { ScheduleDaySwiper } from '../ScheduleDaySwiper';
import { getWeekDays } from '../../../utils';

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

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

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
    <div className="bg-gray-5 flex h-full min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-2 py-3">
        <ScheduleWeekCarousel
          weekStart={weekStart}
          selectedDate={selectedDate}
          onWeekStartChange={handleWeekStartChange}
          onSelectedDateChange={handleSelectedDateChange}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <ScheduleDaySwiper
          weekDays={weekDays}
          selectedDate={selectedDate}
          onSelectedDateChange={handleSelectedDateChange}
          onAddLessonClick={handleAddLesson}
        />
      </div>
    </div>
  );
};
