export type { SchedulerEvent, OccurrenceMode, EventInstance, ScheduleItem } from './model/types';

export {
  buildEventsById,
  buildOccurrenceModesById,
  mapEventInstanceToScheduleItem,
  mapScheduleResponseToScheduleItems,
} from './model/adapters';

export {
  schedulerQueryKeys,
  useClassroomSchedule,
  useCreateClassroomEvent,
  useUpdateClassroomEvent,
  useDeleteClassroomEvent,
  type UseClassroomScheduleParams,
  type CreateClassroomEventParams,
  type UpdateClassroomEventParams,
  type DeleteClassroomEventParams,
} from './model/queries';
