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
export type { ScheduleLessonRow, ICalendarEvent, LessonCancelScope } from './src/ui/types';
export type { ChangeLessonFormData } from 'features.lesson.change';
export type { DominantVisibleMonthInfo } from './src/ui';
export type { NearestLessonCardProps } from './src/ui/components/NearestLessonCard';
export {
  useCalendar,
  useKanbanColumns,
  useIsMobile,
  useCancelLessonModal,
  useChangeLessonModal,
  useLessonInfoModal,
} from './src/hooks';
export {
  DayLessonListMetaProvider,
  useDayLessonListMeta,
} from './src/ui/contexts/DayLessonListMetaContext';
export { useSetEvents, useSetEventsLoading } from './src/store/eventsStore';
export type { UseLessonInfoModalOptions } from './src/hooks/useLessonInfoModal';
export type { UseChangeLessonModalOptions } from './src/hooks/useChangeLessonModal';
export { calendarEn, calendarRu } from './src/locales';
export { getScheduleLessonEndAt } from './src/utils/getScheduleLessonEndAt';
export {
  StartLessonButton,
  type StartLessonButtonProps,
} from './src/ui/components/StartLessonButton';
export {
  mapEventInstanceToScheduleItem,
  mapScheduleResponseToScheduleItems,
  buildOccurrenceCancellationParams,
  getTutorClassroomSchedule,
  getStudentClassroomSchedule,
  createClassroomEvent,
  updateClassroomEvent,
  deleteClassroomEvent,
  cancelEventInstance,
  uncancelEventInstance,
  cancelRepeatedVirtualInstance,
  schedulerQueryKeys,
  useTutorClassroomSchedule,
  useStudentClassroomSchedule,
  useCreateClassroomEvent,
  useUpdateClassroomEvent,
  useDeleteClassroomEvent,
  useCancelEventInstance,
  useUncancelEventInstance,
  useCancelRepeatedVirtualInstance,
} from 'common.services';
export type {
  SchedulerEvent,
  SingleEvent,
  RepeatingEvent,
  RepetitionMode,
  EventInstance,
  SoleEventInstance,
  PersistedRepeatedEventInstance,
  VirtualRepeatedEventInstance,
  ScheduleItem,
  GetClassroomScheduleParams,
  UseClassroomScheduleParams,
  CreateClassroomEventParams,
  UpdateClassroomEventParams,
  DeleteClassroomEventParams,
  CancelEventInstanceParams,
  UncancelEventInstanceParams,
  CancelRepeatedVirtualInstanceParams,
  OccurrenceCancelApiTarget,
} from 'common.services';
export type {
  SchedulerEventDto,
  SoleEventInstanceInputDto,
  SingleEventInputDto,
  RepeatingEventInputDto,
  CreateClassroomEventRequestDto,
  UpdateClassroomEventRequestDto,
  DailyRepetitionModeInputDto,
  WeeklyRepetitionModeInputDto,
  RepetitionModeInputDto,
  DailyRepetitionModeDto,
  WeeklyRepetitionModeDto,
  RepetitionModeDto,
  SoleEventInstanceDto,
  PersistedRepeatedEventInstanceDto,
  VirtualRepeatedEventInstanceDto,
  EventInstanceDto,
} from 'common.api';
