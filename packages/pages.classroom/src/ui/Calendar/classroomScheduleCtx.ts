import { createContext } from 'react';
import type { ICalendarEvent } from 'modules.calendar';

export type ClassroomScheduleContextValue = {
  weekDays: Date[];
  weekStart: Date;
  visibleDays: Date[];
  visibleDayCount: number;
  setVisibleCount: (count: number) => void;
  goToPrev: (count: number) => void;
  goToNext: (count: number) => void;
  goToWeekStart: (date: Date) => void;
  goToVisibleWindowForDate: (date: Date, visibleCount: number) => void;
  goToDay: (date: Date) => void;
  onAddLessonClick?: (date?: Date) => void;
  pendingEventToOpen: ICalendarEvent | null;
  pendingAnchorDate: Date | null;
  pendingAnchorToken: number;
  acknowledgePendingLessonOpen: () => void;
  acknowledgeAnchorNavigation: () => void;
  mobileScheduleAnchorTs: number | null;
};

export const ClassroomScheduleContext = createContext<ClassroomScheduleContextValue | null>(null);
