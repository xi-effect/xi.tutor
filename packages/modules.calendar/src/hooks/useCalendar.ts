import { useCallback, useMemo, useState } from 'react';
import { addDays, startOfWeek } from 'date-fns';
import { getDaysFrom, getWeekStartForVisibleWindow } from '../utils';

const DEFAULT_VISIBLE_COUNT = 7;

const getInitialWeekStart = () => getWeekStartForVisibleWindow(new Date(), DEFAULT_VISIBLE_COUNT);

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

  const goToToday = useCallback((visibleCount = DEFAULT_VISIBLE_COUNT) => {
    setWeekStart(getWeekStartForVisibleWindow(new Date(), visibleCount));
  }, []);

  /** Подстроить начало окна так, чтобы `anchorDay` попадал в видимые колонки */
  const syncWeekStartForVisibleCount = useCallback(
    (visibleCount: number, anchorDay = new Date()) => {
      setWeekStart(getWeekStartForVisibleWindow(anchorDay, visibleCount));
    },
    [],
  );

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

  return {
    weekDays,
    weekStart,
    goToPrev,
    goToNext,
    goToToday,
    goToWeekStart,
    goToDay,
    syncWeekStartForVisibleCount,
  };
};
