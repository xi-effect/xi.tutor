export {
  CalendarModule,
  CalendarWeekNav,
  ScheduleDateCarousel,
  DayLessonRow,
  DayLessonsPanel,
  NearestLessonCard,
  ScheduleKanban,
  ScheduleMobileView,
} from './src/ui';
export type { CalendarWeekNavProps } from './src/ui';
export type { ScheduleLessonRow, ICalendarEvent } from './src/ui/types';
export type { DominantVisibleMonthInfo } from './src/ui';
export type { NearestLessonCardProps } from './src/ui/components/NearestLessonCard';
export {
  useCalendar,
  useKanbanColumns,
  useIsMobile,
  useCancelLessonModal,
  useLessonInfoModal,
} from './src/hooks';
export {
  DayLessonListMetaProvider,
  useDayLessonListMeta,
} from './src/ui/contexts/DayLessonListMetaContext';
export type { UseLessonInfoModalOptions } from './src/hooks/useLessonInfoModal';
export { calendarEn, calendarRu } from './src/locales';
