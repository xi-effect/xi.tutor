export {
  CalendarModule,
  CalendarScheduleProvider,
  useCalendarSchedule,
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
export {
  useLessonClassroomPresentation,
  type LessonClassroomPresentationT,
} from './src/hooks/useLessonClassroomPresentation';
export { getScheduleLessonEndAt } from './src/utils/getScheduleLessonEndAt';
export { getCalendarDayQueryRange } from './src/utils/getCalendarDayQueryRange';
export { mapScheduleItemToLessonRow } from './src/utils/mapScheduleItemToLessonRow';
export { getScheduleItemRowKey } from './src/utils/getScheduleItemRowKey';
export {
  bitmaskUtcToLocal,
  bitmaskLocalToUtc,
  bitmaskToWeekdays,
  weekdaysToBitmask,
} from './src/utils/bitmaskTimezone';
export { toLocalISOString } from './src/utils/dateTimezone';
export { findNearestLessonIndex } from './src/utils/findNearestLessonIndex';
export { useScheduleLessonRowsForDay } from './src/hooks/useScheduleLessonRowsForDay';
export {
  mapScheduleItemToCalendarEvent,
  mapScheduleItemsToCalendarEvents,
  getScheduleQueryRange,
} from './src/utils/scheduleMapping';
export { StartLessonButton, type StartLessonButtonProps } from 'features.lesson.start';
export {
  mapEventInstanceToScheduleItem,
  mapScheduleResponseToScheduleItems,
  buildOccurrenceCancellationParams,
  getTutorClassroomSchedule,
  getStudentClassroomSchedule,
  getTutorSchedule,
  getStudentSchedule,
  createClassroomEvent,
  updateClassroomEvent,
  deleteClassroomEvent,
  cancelEventInstance,
  uncancelEventInstance,
  cancelRepeatedVirtualInstance,
  cancelRepeatingEventAfterTimestamp,
  getTutorEventInstanceDetails,
  getStudentEventInstanceDetails,
  getTutorRepeatedEventInstanceDetails,
  getStudentRepeatedEventInstanceDetails,
  rescheduleRepeatedVirtualInstance,
  rescheduleSoleEventInstance,
  schedulerQueryKeys,
  useTutorClassroomSchedule,
  useStudentClassroomSchedule,
  useTutorSchedule,
  useStudentSchedule,
  useTutorEventInstanceDetails,
  useStudentEventInstanceDetails,
  useTutorRepeatedEventInstanceDetails,
  useStudentRepeatedEventInstanceDetails,
  useRescheduleRepeatedVirtualInstance,
  useRescheduleSoleEventInstance,
  useCreateClassroomEvent,
  useUpdateClassroomEvent,
  useDeleteClassroomEvent,
  useCancelEventInstance,
  useUncancelEventInstance,
  useCancelRepeatedVirtualInstance,
  useCancelRepeatingEventAfterTimestamp,
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
  GetGlobalScheduleParams,
  UseClassroomScheduleParams,
  UseGlobalScheduleParams,
  CreateClassroomEventParams,
  UpdateClassroomEventParams,
  DeleteClassroomEventParams,
  CancelEventInstanceParams,
  UncancelEventInstanceParams,
  CancelRepeatedVirtualInstanceParams,
  CancelRepeatingEventAfterTimestampParams,
  RescheduleRepeatedVirtualInstanceParams,
  RescheduleSoleEventInstanceParams,
  GetEventInstanceDetailsParams,
  GetRepeatedEventInstanceDetailsParams,
  UseEventInstanceDetailsParams,
  UseRepeatedEventInstanceDetailsParams,
  OccurrenceCancelApiTarget,
  DetailedEventInstanceDto,
  SoleEventInstanceDetailedDto,
  PersistedRepeatedEventInstanceDetailedDto,
  VirtualRepeatedEventInstanceDetailedDto,
  CancelRepeatingEventAfterTimestampInputDto,
  CreateClassroomEventResponseDto,
  CreateSingleEventResponseDto,
  CreateRepeatingEventResponseDto,
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
  EventInstanceTimeSlotInputDto,
} from 'common.api';
