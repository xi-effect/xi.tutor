import { useCallback, useMemo, useState } from 'react';
import { addDays, startOfWeek } from 'date-fns';
import { getDaysFrom } from '../utils';

const getInitialWeekStart = () => startOfWeek(new Date(), { weekStartsOn: 1 });

type UseCalendarOptions = {
  /** Начальная неделя — например, из диплинка `focused_at` в URL кабинета */
  initialAnchorDate?: Date | null;
  /** true — окно с даты занятия (goToDay), false — с понедельника недели */
  initialAnchorUseDay?: boolean;
};

export const useCalendar = (options?: UseCalendarOptions) => {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const anchor = options?.initialAnchorDate;
    if (anchor != null && Number.isFinite(anchor.getTime())) {
      if (options?.initialAnchorUseDay) {
        const d = new Date(anchor);
        d.setHours(0, 0, 0, 0);
        return d;
      }
      return startOfWeek(anchor, { weekStartsOn: 1 });
    }
    return getInitialWeekStart();
  });

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

  /** Переход к окну, начинающемуся с указанной даты (без округления до понедельника) */
  const goToDay = useCallback((date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    setWeekStart(d);
  }, []);

  return { weekDays, weekStart, goToPrev, goToNext, goToToday, goToWeekStart, goToDay };
};
