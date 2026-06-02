import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useCalendar } from 'modules.calendar';
import {
  parseScheduleAnchorFromSearch,
  useClassroomScheduleDeepLink,
} from './useClassroomScheduleDeepLink';
import { useClassroomScheduleSearch } from './useClassroomScheduleSearch';

type ClassroomScheduleContextValue = {
  weekDays: Date[];
  weekStart: Date;
  visibleDays: Date[];
  setVisibleCount: (count: number) => void;
  goToPrev: (count: number) => void;
  goToNext: (count: number) => void;
  goToWeekStart: (date: Date) => void;
  onAddLessonClick?: (date?: Date) => void;
  pendingOpenLessonInstanceId: string | null;
  acknowledgePendingLessonOpen: () => void;
  mobileScheduleAnchorTs: number | null;
};

const ClassroomScheduleContext = createContext<ClassroomScheduleContextValue | null>(null);

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
  const search = useClassroomScheduleSearch();

  const initialAnchorDate = useMemo(() => parseScheduleAnchorFromSearch(search), [search]);

  const { weekDays, weekStart, goToPrev, goToNext, goToWeekStart } = useCalendar({
    initialAnchorDate,
  });
  const [visibleCount, setVisibleCount] = useState(weekDays.length);
  const visibleDays = useMemo(() => weekDays.slice(0, visibleCount), [weekDays, visibleCount]);

  const scheduleDeepLink = useClassroomScheduleDeepLink({ goToWeekStart });

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
      pendingOpenLessonInstanceId: scheduleDeepLink.pendingOpenLessonInstanceId,
      acknowledgePendingLessonOpen: scheduleDeepLink.acknowledgePendingLessonOpen,
      mobileScheduleAnchorTs: scheduleDeepLink.mobileScheduleAnchorTs,
    }),
    [
      weekDays,
      weekStart,
      visibleDays,
      goToPrev,
      goToNext,
      goToWeekStart,
      onAddLessonClick,
      scheduleDeepLink.pendingOpenLessonInstanceId,
      scheduleDeepLink.acknowledgePendingLessonOpen,
      scheduleDeepLink.mobileScheduleAnchorTs,
    ],
  );

  return (
    <ClassroomScheduleContext.Provider value={value}>{children}</ClassroomScheduleContext.Provider>
  );
};
