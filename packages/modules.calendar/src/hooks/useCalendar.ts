import { useCallback, useMemo, useState } from 'react';
import { addDays, startOfWeek } from 'date-fns';
import { getDaysFrom } from '../utils';

const getInitialWeekStart = () => startOfWeek(new Date(), { weekStartsOn: 1 });

export const useCalendar = () => {
  const [weekStart, setWeekStart] = useState<Date>(getInitialWeekStart);

  /** Всегда 7 дней от weekStart (окно может сдвигаться по видимым дням) */
  const weekDays = useMemo(() => getDaysFrom(weekStart, 7), [weekStart]);

  const goToPrev = useCallback((dayCount: number) => {
    setWeekStart((prev) => addDays(prev, -dayCount));
  }, []);

  const goToNext = useCallback((dayCount: number) => {
    setWeekStart((prev) => addDays(prev, dayCount));
  }, []);

  const goToToday = useCallback(() => {
    setWeekStart(getInitialWeekStart());
  }, []);

  /** Переход к неделе, содержащей указанную дату */
  const goToWeekStart = useCallback((date: Date) => {
    setWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
  }, []);

  return { weekDays, weekStart, goToPrev, goToNext, goToToday, goToWeekStart };
};
