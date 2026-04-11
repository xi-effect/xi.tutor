export {
  CalendarModule,
  ScheduleDateCarousel,
  DayLessonRow,
  DayLessonsPanel,
  NearestLessonCard,
} from './src/ui';
export type { ScheduleLessonRow } from './src/ui/types';
export type { DominantVisibleMonthInfo } from './src/ui';
export type { NearestLessonCardProps } from './src/ui/components/NearestLessonCard';
export { useCancelLessonModal, useLessonInfoModal } from './src/hooks';
export type { UseLessonInfoModalOptions } from './src/hooks/useLessonInfoModal';
export { calendarEn, calendarRu } from './src/locales';
