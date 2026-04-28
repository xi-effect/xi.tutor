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
  type GetClassroomScheduleResponseDto,
  type CreateClassroomEventRequestDto,
  type UpdateClassroomEventRequestDto,
} from './types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export enum SchedulerQueryKey {
  GetTutorClassroomSchedule = 'GetTutorClassroomSchedule',
  GetStudentClassroomSchedule = 'GetStudentClassroomSchedule',
  CreateClassroomEvent = 'CreateClassroomEvent',
  UpdateClassroomEvent = 'UpdateClassroomEvent',
  DeleteClassroomEvent = 'DeleteClassroomEvent',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const classroomBase = (role: 'student' | 'tutor', classroomId: string) =>
  `${env.VITE_SERVER_URL_BACKEND}/api/protected/scheduler-service/roles/${role}/classrooms/${classroomId}`;

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
};
