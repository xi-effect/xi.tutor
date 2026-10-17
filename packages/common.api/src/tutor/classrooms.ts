import { env } from 'common.env';
import { HttpMethod } from '../config';

enum ClassroomsQueryKey {
  GetClassrooms = 'GetClassrooms',
  CreateGroupClassroom = 'CreateGroupClassroom',
  GetClassroom = 'GetClassroom',
  DeleteClassroom = 'DeleteClassroom',
  UpdateIndividualClassroom = 'UpdateIndividualClassroom',
  UpdateGroupClassroom = 'UpdateGroupClassroom',
  UpdateClassroomStatus = 'UpdateClassroomStatus',
  ClassroomCounts = 'classroomCounts',
  ActiveClassroomsCount = 'activeClassroomsCount',
}

const classroomsApiConfig = {
  [ClassroomsQueryKey.GetClassrooms]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/`,
    method: HttpMethod.GET,
  },

  [ClassroomsQueryKey.CreateGroupClassroom]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/`,
    method: HttpMethod.POST,
  },

  [ClassroomsQueryKey.GetClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/${classroomId}/`,
    method: HttpMethod.GET,
  },

  [ClassroomsQueryKey.DeleteClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/${classroomId}/`,
    method: HttpMethod.DELETE,
  },

  [ClassroomsQueryKey.UpdateIndividualClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/individual-classrooms/${classroomId}/`,
    method: HttpMethod.PATCH,
  },

  [ClassroomsQueryKey.UpdateGroupClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/`,
    method: HttpMethod.PATCH,
  },

  [ClassroomsQueryKey.UpdateClassroomStatus]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/${classroomId}/status/`,
    method: HttpMethod.PUT,
  },

  [ClassroomsQueryKey.ClassroomCounts]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classroom-counts/`,
    method: HttpMethod.GET,
  },

  [ClassroomsQueryKey.ActiveClassroomsCount]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/active-classrooms-count/`,
    method: HttpMethod.GET,
  },
};

const classroomsQueryKeys = {
  classroomCounts: (userId: number) => [ClassroomsQueryKey.ClassroomCounts, userId] as const,
};

export type ClassroomCounts = {
  active: number;
  locked: number;
};

const isClassroomCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

export const parseClassroomCounts = (data: unknown): ClassroomCounts => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid ClassroomCounts');
  }

  const counts = data as Record<string, unknown>;
  if (!isClassroomCount(counts.active) || !isClassroomCount(counts.locked)) {
    throw new Error('Invalid ClassroomCounts');
  }

  return {
    active: counts.active,
    locked: counts.locked,
  };
};

export { classroomsApiConfig, ClassroomsQueryKey, classroomsQueryKeys };
