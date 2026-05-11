import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useCalendar } from 'modules.calendar';

type ClassroomScheduleContextValue = {
  weekDays: Date[];
  weekStart: Date;
  /** Срез weekDays по числу видимых колонок, вычисляется в CalendarScheduleKanban через ResizeObserver. */
  visibleDays: Date[];
  /** Вызывается из CalendarScheduleKanban при изменении числа видимых колонок. */
  setVisibleCount: (count: number) => void;
  goToPrev: (count: number) => void;
  goToNext: (count: number) => void;
  goToWeekStart: (date: Date) => void;
  onAddLessonClick?: (date?: Date) => void;
};

const ClassroomScheduleContext = createContext<ClassroomScheduleContextValue | null>(null);

/** Контекст расписания кабинета (пара с Provider). */
// eslint-disable-next-line react-refresh/only-export-components -- хук и провайдер в одном модуле
export const useClassroomSchedule = () => {
  const ctx = useContext(ClassroomScheduleContext);
  if (!ctx) {
    throw new Error('useClassroomSchedule must be used within ClassroomScheduleProvider');
  }
  return ctx;
};

type ClassroomScheduleProviderProps = {
  children: ReactNode;
  onAddLessonClick?: (date?: Date) => void;
};

export const ClassroomScheduleProvider = ({
  children,
  onAddLessonClick,
}: ClassroomScheduleProviderProps) => {
  const { weekDays, weekStart, goToPrev, goToNext, goToWeekStart } = useCalendar();
  const [visibleCount, setVisibleCount] = useState(weekDays.length);
  const visibleDays = useMemo(() => weekDays.slice(0, visibleCount), [weekDays, visibleCount]);

  const value = useMemo(
    () => ({
      weekDays,
      weekStart,
      visibleDays,
      setVisibleCount,
      goToPrev,
      goToNext,
      goToWeekStart,
      onAddLessonClick,
    }),
    [weekDays, weekStart, visibleDays, goToPrev, goToNext, goToWeekStart, onAddLessonClick],
  );

  return (
    <ClassroomScheduleContext.Provider value={value}>{children}</ClassroomScheduleContext.Provider>
  );
};
