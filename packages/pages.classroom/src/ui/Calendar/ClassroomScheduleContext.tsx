import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useCalendar } from 'modules.calendar';

type ClassroomScheduleContextValue = {
  weekDays: Date[];
  weekStart: Date;
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

  const value = useMemo(
    () => ({ weekDays, weekStart, goToPrev, goToNext, goToWeekStart, onAddLessonClick }),
    [weekDays, weekStart, goToPrev, goToNext, goToWeekStart, onAddLessonClick],
  );

  return (
    <ClassroomScheduleContext.Provider value={value}>{children}</ClassroomScheduleContext.Provider>
  );
};
