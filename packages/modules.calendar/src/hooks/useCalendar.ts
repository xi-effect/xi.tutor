import { useCallback, useMemo, useState } from 'react';
import { addDays, startOfDay, startOfWeek } from 'date-fns';
import { getDaysFrom, getWeekStartForCenteredDate, getWeekStartForVisibleWindow } from '../utils';

const getInitialWeekStart = () => getWeekStartForVisibleWindow(new Date());

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
    setWeekStart(getWeekStartForVisibleWindow(new Date()));
  }, []);

  /** Подстроить начало окна к якорному дню (первая колонка) */
  const syncWeekStartForVisibleCount = useCallback((anchorDay = new Date()) => {
    setWeekStart(getWeekStartForVisibleWindow(anchorDay));
  }, []);

  /** Переход к неделе, содержащей указанную дату */
  const goToWeekStart = useCallback((date: Date) => {
    const next = startOfWeek(date, { weekStartsOn: 1 });
    setWeekStart((prev) => (prev.getTime() === next.getTime() ? prev : next));
  }, []);

  /** Переход к окну, начинающемуся с указанной даты (без округления до понедельника) */
  const goToDay = useCallback((date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    setWeekStart(d);
  }, []);

  /** Выбранная дата — по центру видимого окна (для DatePicker) */
  const goToVisibleWindowForDate = useCallback((date: Date, visibleCount: number) => {
    const day = startOfDay(date);
    if (!Number.isFinite(day.getTime())) return;
    setWeekStart(getWeekStartForCenteredDate(day, visibleCount));
  }, []);

  return {
    weekDays,
    weekStart,
    goToPrev,
    goToNext,
    goToToday,
    goToWeekStart,
    goToDay,
    goToVisibleWindowForDate,
    syncWeekStartForVisibleCount,
  };
};
