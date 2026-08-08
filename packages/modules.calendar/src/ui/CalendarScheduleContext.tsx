import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useCalendar } from '../hooks';

type CalendarScheduleContextValue = {
  weekDays: Date[];
  weekStart: Date;
  /** Срез weekDays по числу видимых колонок, вычисляется в CalendarModule через ResizeObserver. */
  visibleDays: Date[];
  /** Число видимых колонок (из ResizeObserver канбана) */
  visibleDayCount: number;
  /** Вызывается из CalendarModule при изменении числа видимых колонок. */
  setVisibleCount: (count: number) => void;
  goToPrev: (count: number) => void;
  goToNext: (count: number) => void;
  goToWeekStart: (date: Date) => void;
  goToVisibleWindowForDate: (date: Date, visibleCount: number) => void;
};

const CalendarScheduleContext = createContext<CalendarScheduleContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- хук и провайдер в одном модуле
export const useCalendarSchedule = (): CalendarScheduleContextValue => {
  const ctx = useContext(CalendarScheduleContext);
  if (!ctx) {
    throw new Error('useCalendarSchedule must be used within CalendarScheduleProvider');
  }
  return ctx;
};

/**
 * Провайдер состояния навигации по неделям для глобального календаря `/schedule`.
 * Позволяет CalendarModule и CalendarPage читать одно и то же weekDays/weekStart,
 * что обеспечивает корректный refetch при смене видимой недели.
 *
 * visibleDays обновляется CalendarModule через setVisibleCount — это позволяет
 * страницам запрашивать данные только для отображаемого диапазона колонок.
 */
export const CalendarScheduleProvider = ({ children }: { children: ReactNode }) => {
  const {
    weekDays,
    weekStart,
    goToPrev,
    goToNext,
    goToWeekStart,
    goToVisibleWindowForDate,
    syncWeekStartForVisibleCount,
  } = useCalendar();
  const [visibleCount, setVisibleCountState] = useState(weekDays.length);
  const userHasNavigatedRef = useRef(false);
  const visibleDays = useMemo(() => weekDays.slice(0, visibleCount), [weekDays, visibleCount]);

  const setVisibleCount = useCallback((count: number) => {
    setVisibleCountState(count);
  }, []);

  useLayoutEffect(() => {
    if (userHasNavigatedRef.current) return;
    syncWeekStartForVisibleCount(visibleCount);
  }, [visibleCount, syncWeekStartForVisibleCount]);

  const goToPrevWithNav = useCallback(
    (count: number) => {
      userHasNavigatedRef.current = true;
      goToPrev(count);
    },
    [goToPrev],
  );

  const goToNextWithNav = useCallback(
    (count: number) => {
      userHasNavigatedRef.current = true;
      goToNext(count);
    },
    [goToNext],
  );

  const goToWeekStartWithNav = useCallback(
    (date: Date) => {
      userHasNavigatedRef.current = true;
      goToWeekStart(date);
    },
    [goToWeekStart],
  );

  const goToVisibleWindowForDateWithNav = useCallback(
    (date: Date, visibleCount: number) => {
      userHasNavigatedRef.current = true;
      goToVisibleWindowForDate(date, visibleCount);
    },
    [goToVisibleWindowForDate],
  );

  const value = useMemo(
    () => ({
      weekDays,
      weekStart,
      visibleDays,
      visibleDayCount: visibleCount,
      setVisibleCount,
      goToPrev: goToPrevWithNav,
      goToNext: goToNextWithNav,
      goToWeekStart: goToWeekStartWithNav,
      goToVisibleWindowForDate: goToVisibleWindowForDateWithNav,
    }),
    [
      weekDays,
      weekStart,
      visibleDays,
      visibleCount,
      setVisibleCount,
      goToPrevWithNav,
      goToNextWithNav,
      goToWeekStartWithNav,
      goToVisibleWindowForDateWithNav,
    ],
  );

  return (
    <CalendarScheduleContext.Provider value={value}>{children}</CalendarScheduleContext.Provider>
  );
};
