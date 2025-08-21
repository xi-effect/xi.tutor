import { env } from 'common.env';
import { HttpMethod } from './config';

enum ClassroomsQueryKey {
  SearchClassrooms = 'SearchClassrooms',
  CreateGroupClassroom = 'CreateGroupClassroom',
  GetClassroom = 'GetClassroom',
  DeleteClassroom = 'DeleteClassroom',
  UpdateIndividualClassroom = 'UpdateIndividualClassroom',
  UpdateGroupClassroom = 'UpdateGroupClassroom',
  UpdateClassroomStatus = 'UpdateClassroomStatus',
}

const classroomsApiConfig = {
  [ClassroomsQueryKey.SearchClassrooms]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/classrooms/searches/`,
    method: HttpMethod.POST,
  },

  [ClassroomsQueryKey.CreateGroupClassroom]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/group-classrooms/`,
    method: HttpMethod.POST,
  },

  [ClassroomsQueryKey.GetClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/classrooms/${classroomId}/`,
    method: HttpMethod.GET,
  },

  [ClassroomsQueryKey.DeleteClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/classrooms/${classroomId}/`,
    method: HttpMethod.DELETE,
  },

  [ClassroomsQueryKey.UpdateIndividualClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/individual-classrooms/${classroomId}/`,
    method: HttpMethod.PATCH,
  },

  [ClassroomsQueryKey.UpdateGroupClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/group-classrooms/${classroomId}/`,
    method: HttpMethod.PATCH,
  },

  [ClassroomsQueryKey.UpdateClassroomStatus]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/classrooms/${classroomId}/status/`,
    method: HttpMethod.PUT,
  },
};

export { classroomsApiConfig, ClassroomsQueryKey };
