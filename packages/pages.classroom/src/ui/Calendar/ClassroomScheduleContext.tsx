import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import { useCalendar, useKanbanColumns } from 'modules.calendar';

type ClassroomScheduleContextValue = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  weekStart: Date;
  visibleDays: Date[];
  goToPrev: () => void;
  goToNext: () => void;
  goToWeekStart: (date: Date) => void;
  columnWidth: number;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { weekDays, weekStart, goToPrev, goToNext, goToWeekStart } = useCalendar();
  const { columnWidth, visibleCount } = useKanbanColumns(containerRef, weekDays.length);
  const visibleDays = weekDays.slice(0, visibleCount);

  const value = useMemo(
    () => ({
      containerRef,
      weekStart,
      visibleDays,
      columnWidth,
      goToPrev: () => goToPrev(visibleCount),
      goToNext: () => goToNext(visibleCount),
      goToWeekStart,
      onAddLessonClick,
    }),
    [
      weekStart,
      visibleDays,
      columnWidth,
      visibleCount,
      goToPrev,
      goToNext,
      goToWeekStart,
      onAddLessonClick,
    ],
  );

  return (
    <ClassroomScheduleContext.Provider value={value}>{children}</ClassroomScheduleContext.Provider>
  );
};
