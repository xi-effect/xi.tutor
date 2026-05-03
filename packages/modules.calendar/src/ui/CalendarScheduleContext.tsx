import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useCalendar } from '../hooks';

type CalendarScheduleContextValue = {
  weekDays: Date[];
  weekStart: Date;
  goToPrev: (count: number) => void;
  goToNext: (count: number) => void;
  goToWeekStart: (date: Date) => void;
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
 */
export const CalendarScheduleProvider = ({ children }: { children: ReactNode }) => {
  const { weekDays, weekStart, goToPrev, goToNext, goToWeekStart } = useCalendar();

  const value = useMemo(
    () => ({ weekDays, weekStart, goToPrev, goToNext, goToWeekStart }),
    [weekDays, weekStart, goToPrev, goToNext, goToWeekStart],
  );

  return (
    <CalendarScheduleContext.Provider value={value}>{children}</CalendarScheduleContext.Provider>
  );
};
