import { env } from 'common.env';
import { HttpMethod } from '../config';

export {
  type SchedulerEventDto,
  type EventInputDto,
  type SoleEventInstanceInputDto,
  type DailyRepetitionModeInputDto,
  type WeeklyRepetitionModeInputDto,
  type RepetitionModeInputDto,
  type SingleEventInputDto,
  type RepeatingEventInputDto,
  type DailyRepetitionModeDto,
  type WeeklyRepetitionModeDto,
  type RepetitionModeDto,
  type SoleEventInstanceDto,
  type PersistedRepeatedEventInstanceDto,
  type VirtualRepeatedEventInstanceDto,
  type EventInstanceDto,
  type EventInstanceTimeSlotInputDto,
  type GetEventInstanceDetailsResponseDto,
  type CreateClassroomEventRequestDto,
  type UpdateClassroomEventRequestDto,
  type SoleEventInstanceDetailedDto,
  type PersistedRepeatedEventInstanceDetailedDto,
  type VirtualRepeatedEventInstanceDetailedDto,
  type DetailedEventInstanceDto,
  type CancelRepeatingEventAfterTimestampInputDto,
  type CreateSingleEventResponseDto,
  type CreateRepeatingEventResponseDto,
  type CreateClassroomEventResponseDto,
} from './types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export enum SchedulerQueryKey {
  GetTutorClassroomSchedule = 'GetTutorClassroomSchedule',
  GetStudentClassroomSchedule = 'GetStudentClassroomSchedule',
  GetTutorSchedule = 'GetTutorSchedule',
  GetStudentSchedule = 'GetStudentSchedule',
  GetTutorEventInstanceDetails = 'GetTutorEventInstanceDetails',
  GetStudentEventInstanceDetails = 'GetStudentEventInstanceDetails',
  GetTutorRepeatedEventInstanceDetails = 'GetTutorRepeatedEventInstanceDetails',
  GetStudentRepeatedEventInstanceDetails = 'GetStudentRepeatedEventInstanceDetails',
  CreateClassroomEvent = 'CreateClassroomEvent',
  UpdateClassroomEvent = 'UpdateClassroomEvent',
  DeleteClassroomEvent = 'DeleteClassroomEvent',
  CancelEventInstance = 'CancelEventInstance',
  UncancelEventInstance = 'UncancelEventInstance',
  CancelRepeatedVirtualInstance = 'CancelRepeatedVirtualInstance',
  CancelRepeatingEventAfterTimestamp = 'CancelRepeatingEventAfterTimestamp',
  RescheduleRepeatedVirtualInstance = 'RescheduleRepeatedVirtualInstance',
  RescheduleSoleEventInstance = 'RescheduleSoleEventInstance',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const roleBase = (role: 'student' | 'tutor') =>
  `${env.VITE_SERVER_URL_BACKEND}/api/protected/scheduler-service/roles/${role}`;

const classroomBase = (role: 'student' | 'tutor', classroomId: string) =>
  `${roleBase(role)}/classrooms/${classroomId}`;

// ---------------------------------------------------------------------------
// API config
// ---------------------------------------------------------------------------

export const schedulerApiConfig = {
  [SchedulerQueryKey.GetTutorClassroomSchedule]: {
    getUrl: (classroomId: string) => `${classroomBase('tutor', classroomId)}/schedule/`,
    method: HttpMethod.GET,
  },

  [SchedulerQueryKey.GetStudentClassroomSchedule]: {
    getUrl: (classroomId: string) => `${classroomBase('student', classroomId)}/schedule/`,
    method: HttpMethod.GET,
  },

  [SchedulerQueryKey.GetTutorSchedule]: {
    getUrl: () => `${roleBase('tutor')}/schedule/`,
    method: HttpMethod.GET,
  },

  [SchedulerQueryKey.GetStudentSchedule]: {
    getUrl: () => `${roleBase('student')}/schedule/`,
    method: HttpMethod.GET,
  },

  [SchedulerQueryKey.CreateClassroomEvent]: {
    getUrl: (classroomId: string) => `${classroomBase('tutor', classroomId)}/events/`,
    method: HttpMethod.POST,
  },

  /** event_id — числовой id события (приводится к строке) */
  [SchedulerQueryKey.UpdateClassroomEvent]: {
    getUrl: (classroomId: string, eventId: string) =>
      `${classroomBase('tutor', classroomId)}/events/${eventId}/`,
    method: HttpMethod.PATCH,
  },

  [SchedulerQueryKey.DeleteClassroomEvent]: {
    getUrl: (classroomId: string, eventId: string) =>
      `${classroomBase('tutor', classroomId)}/events/${eventId}/`,
    method: HttpMethod.DELETE,
  },

  [SchedulerQueryKey.CancelEventInstance]: {
    getUrl: (classroomId: string, eventInstanceId: string) =>
      `${classroomBase('tutor', classroomId)}/event-instances/${eventInstanceId}/cancellation/`,
    method: HttpMethod.POST,
  },

  [SchedulerQueryKey.UncancelEventInstance]: {
    getUrl: (classroomId: string, eventInstanceId: string) =>
      `${classroomBase('tutor', classroomId)}/event-instances/${eventInstanceId}/cancellation/`,
    method: HttpMethod.DELETE,
  },

  [SchedulerQueryKey.CancelRepeatedVirtualInstance]: {
    getUrl: (classroomId: string, repetitionModeId: string, instanceIndex: number) =>
      `${classroomBase(
        'tutor',
        classroomId,
      )}/repetition-modes/${repetitionModeId}/instances/${instanceIndex}/cancellation/`,
    method: HttpMethod.POST,
  },

  /** Отмена повторяющегося события начиная с заданного времени (боди — cancel_after). */
  [SchedulerQueryKey.CancelRepeatingEventAfterTimestamp]: {
    getUrl: (classroomId: string, eventId: string) =>
      `${classroomBase('tutor', classroomId)}/events/${eventId}/cancellations/`,
    method: HttpMethod.POST,
  },

  [SchedulerQueryKey.GetTutorEventInstanceDetails]: {
    getUrl: (classroomId: string, eventInstanceId: string) =>
      `${classroomBase('tutor', classroomId)}/event-instances/${eventInstanceId}/`,
    method: HttpMethod.GET,
  },

  [SchedulerQueryKey.GetStudentEventInstanceDetails]: {
    getUrl: (classroomId: string, eventInstanceId: string) =>
      `${classroomBase('student', classroomId)}/event-instances/${eventInstanceId}/`,
    method: HttpMethod.GET,
  },

  [SchedulerQueryKey.GetTutorRepeatedEventInstanceDetails]: {
    getUrl: (classroomId: string, repetitionModeId: string, instanceIndex: number) =>
      `${classroomBase(
        'tutor',
        classroomId,
      )}/repetition-modes/${repetitionModeId}/instances/${instanceIndex}/`,
    method: HttpMethod.GET,
  },

  [SchedulerQueryKey.GetStudentRepeatedEventInstanceDetails]: {
    getUrl: (classroomId: string, repetitionModeId: string, instanceIndex: number) =>
      `${classroomBase(
        'student',
        classroomId,
      )}/repetition-modes/${repetitionModeId}/instances/${instanceIndex}/`,
    method: HttpMethod.GET,
  },

  /** Повторяющийся виртуальный инстанс: repetition_mode_id + instance_index */
  [SchedulerQueryKey.RescheduleRepeatedVirtualInstance]: {
    getUrl: (classroomId: string, repetitionModeId: string, instanceIndex: number) =>
      `${classroomBase(
        'tutor',
        classroomId,
      )}/repetition-modes/${repetitionModeId}/instances/${instanceIndex}/time-slot/`,
    method: HttpMethod.PUT,
  },

  /** Перенос по event_instance_id: sole, repeated_persisted (тело — EventInstanceTimeSlotInput) */
  [SchedulerQueryKey.RescheduleSoleEventInstance]: {
    getUrl: (classroomId: string, eventInstanceId: string) =>
      `${classroomBase('tutor', classroomId)}/event-instances/${eventInstanceId}/time-slot/`,
    method: HttpMethod.PUT,
  },
};
