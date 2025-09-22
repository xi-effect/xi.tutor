import { env } from 'common.env';
import { HttpMethod } from './config';

enum CallsQueryKey {
  ReactivateCall = 'ReactivateCall',
  CreateAccessTokenStudent = 'CreateAccessTokenStudent',
  CreateAccessTokenTutor = 'CreateAccessTokenTutor',
  GetParticipantsTutor = 'GetParticipantsTutor',
  GetParticipantsStudent = 'GetParticipantsStudent',
}

const callsApiConfig = {
  [CallsQueryKey.ReactivateCall]: {
    getUrl: (classroom_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/conference-service/roles/tutor/classrooms/${classroom_id}/conference/`,
    method: HttpMethod.POST,
  },
  [CallsQueryKey.CreateAccessTokenStudent]: {
    getUrl: (classroom_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/conference-service/roles/student/classrooms/${classroom_id}/conference/access-tokens/`,
    method: HttpMethod.POST,
  },
  [CallsQueryKey.CreateAccessTokenTutor]: {
    getUrl: (classroom_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/conference-service/roles/tutor/classrooms/${classroom_id}/conference/access-tokens/`,
    method: HttpMethod.POST,
  },
  [CallsQueryKey.GetParticipantsTutor]: {
    getUrl: (classroom_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/conference-service/roles/tutor/classrooms/${classroom_id}/conference/participants/`,
    method: HttpMethod.GET,
  },
  [CallsQueryKey.GetParticipantsStudent]: {
    getUrl: (classroom_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/conference-service/roles/student/classrooms/${classroom_id}/conference/participants/`,
    method: HttpMethod.GET,
  },
};

export { callsApiConfig, CallsQueryKey };
