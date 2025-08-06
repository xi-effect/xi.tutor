import { env } from 'common.env';
import { HttpMethod } from './config';

enum ClassroomsQueryKey {
  Classrooms = 'Classrooms',
  GetClassroom = 'GetClassroom',
  AddClassroom = 'AddClassroom',
  UpdateClassroom = 'UpdateClassroom',
  DeleteClassroom = 'DeleteClassroom',
}

const classroomsApiConfig = {
  [ClassroomsQueryKey.Classrooms]: {
    getUrl: (limit: number, lastOpenedBefore?: string) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (lastOpenedBefore) {
        params.append('last_opened_before', lastOpenedBefore);
      }

      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/classrooms/?${params.toString()}`;
    },
    method: HttpMethod.GET,
  },

  [ClassroomsQueryKey.GetClassroom]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/classrooms/${id}/`,
    method: HttpMethod.GET,
  },

  [ClassroomsQueryKey.AddClassroom]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/classrooms/`,
    method: HttpMethod.POST,
  },

  [ClassroomsQueryKey.UpdateClassroom]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/classrooms/${id}/`,
    method: HttpMethod.PATCH,
  },

  [ClassroomsQueryKey.DeleteClassroom]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/classrooms/${id}/`,
    method: HttpMethod.DELETE,
  },
};

export { classroomsApiConfig, ClassroomsQueryKey };
