import { env } from 'common.env';
import { HttpMethod } from '../config';

export {
  type SchedulerEventDto,
  type OccurrenceModeDto,
  type OccurrenceModeInputDto,
  type SingleOccurrenceModeDto,
  type DailyOccurrenceModeDto,
  type WeeklyOccurrenceModeDto,
  type ExceptionalOccurrenceModeDto,
  type SingleOccurrenceModeInputDto,
  type DailyOccurrenceModeInputDto,
  type WeeklyOccurrenceModeInputDto,
  type EventInstanceDto,
  type GetClassroomScheduleResponseDto,
  type CreateClassroomEventRequestDto,
  type UpdateClassroomEventRequestDto,
} from './types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export enum SchedulerQueryKey {
  GetClassroomSchedule = 'GetClassroomSchedule',
  CreateClassroomEvent = 'CreateClassroomEvent',
  UpdateClassroomEvent = 'UpdateClassroomEvent',
  DeleteClassroomEvent = 'DeleteClassroomEvent',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const classroomBase = (classroomId: string) =>
  `${env.VITE_SERVER_URL_BACKEND}/api/protected/scheduler-service/roles/tutor/classrooms/${classroomId}`;

// ---------------------------------------------------------------------------
// API config
// ---------------------------------------------------------------------------

export const schedulerApiConfig = {
  [SchedulerQueryKey.GetClassroomSchedule]: {
    getUrl: (classroomId: string) => `${classroomBase(classroomId)}/schedule/`,
    method: HttpMethod.GET,
  },

  [SchedulerQueryKey.CreateClassroomEvent]: {
    getUrl: (classroomId: string) => `${classroomBase(classroomId)}/events/`,
    method: HttpMethod.POST,
  },

  /** event_id — числовой id события (приводится к строке) */
  [SchedulerQueryKey.UpdateClassroomEvent]: {
    getUrl: (classroomId: string, eventId: string) =>
      `${classroomBase(classroomId)}/events/${eventId}/`,
    method: HttpMethod.PATCH,
  },

  [SchedulerQueryKey.DeleteClassroomEvent]: {
    getUrl: (classroomId: string, eventId: string) =>
      `${classroomBase(classroomId)}/events/${eventId}/`,
    method: HttpMethod.DELETE,
  },
};
