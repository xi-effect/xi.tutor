import { useCallback, useMemo, useState } from 'react';
import { addWeeks, startOfWeek } from 'date-fns';
import { getWeekDays } from '../utils';

const getInitialWeekStart = () => startOfWeek(new Date(), { weekStartsOn: 1 });

export const useCalendar = () => {
  const [weekStart, setWeekStart] = useState<Date>(getInitialWeekStart);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const goToPrevWeek = useCallback(() => {
    setWeekStart((prev) => addWeeks(prev, -1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => addWeeks(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setWeekStart(getInitialWeekStart());
  }, []);

  return { weekDays, weekStart, goToPrevWeek, goToNextWeek, goToToday };
};
