import { env } from 'common.env';
import { HttpMethod } from './config';

enum StudentQueryKey {
  Classrooms = 'Classrooms',
  GetClassroom = 'GetClassroom',
  InvitationPreview = 'InvitationPreview',
  UseInvitation = 'UseInvitation',
  Tutors = 'Tutors',
  GetTutor = 'GetTutor',
}

const studentApiConfig = {
  [StudentQueryKey.Classrooms]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/student/classrooms/`,
    method: HttpMethod.GET,
  },
  [StudentQueryKey.GetClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/student/classrooms/${classroomId}/`,
    method: HttpMethod.GET,
  },
  [StudentQueryKey.InvitationPreview]: {
    getUrl: (code: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/student/invitations/${code}/preview/`,
    method: HttpMethod.GET,
  },
  [StudentQueryKey.UseInvitation]: {
    getUrl: (code: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/student/invitations/${code}/usages/`,
    method: HttpMethod.POST,
  },
  [StudentQueryKey.Tutors]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/student/tutors/`,
    method: HttpMethod.GET,
  },
  [StudentQueryKey.GetTutor]: {
    getUrl: (tutorId: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/student/tutors/${tutorId}/`,
    method: HttpMethod.GET,
  },
};

export { studentApiConfig, StudentQueryKey };
