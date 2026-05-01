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
} from './model/types';

export type { GetEventInstanceDetailsResponseDto } from 'common.api';

export {
  mapEventInstanceToScheduleItem,
  mapScheduleResponseToScheduleItems,
} from './model/adapters';

export {
  buildOccurrenceCancellationParams,
  type OccurrenceCancelApiTarget,
} from './model/occurrenceCancel';

export {
  getTutorClassroomSchedule,
  getStudentClassroomSchedule,
  getTutorEventInstanceDetails,
  getStudentEventInstanceDetails,
  rescheduleRepeatedVirtualInstance,
  rescheduleSoleEventInstance,
  createClassroomEvent,
  updateClassroomEvent,
  deleteClassroomEvent,
  cancelEventInstance,
  uncancelEventInstance,
  cancelRepeatedVirtualInstance,
  schedulerQueryKeys,
  useClassroomSchedule,
  useTutorClassroomSchedule,
  useStudentClassroomSchedule,
  useTutorEventInstanceDetails,
  useStudentEventInstanceDetails,
  useRescheduleRepeatedVirtualInstance,
  useRescheduleSoleEventInstance,
  useCreateClassroomEvent,
  useUpdateClassroomEvent,
  useDeleteClassroomEvent,
  useCancelEventInstance,
  useUncancelEventInstance,
  useCancelRepeatedVirtualInstance,
  type GetClassroomScheduleParams,
  type UseClassroomScheduleParams,
  type UseEventInstanceDetailsParams,
  type GetEventInstanceDetailsParams,
  type CreateClassroomEventParams,
  type UpdateClassroomEventParams,
  type DeleteClassroomEventParams,
  type CancelEventInstanceParams,
  type UncancelEventInstanceParams,
  type CancelRepeatedVirtualInstanceParams,
  type RescheduleRepeatedVirtualInstanceParams,
  type RescheduleSoleEventInstanceParams,
} from './model/queries';
