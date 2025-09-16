import { env } from 'common.env';
import { HttpMethod } from './config';

enum CallsQueryKey {
  CreateAccessToken = 'CreateAccessToken',
  GetParticipants = 'GetParticipants',
}

const callsApiConfig = {
  [CallsQueryKey.CreateAccessToken]: {
    getUrl: (classroom_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/conference-service/roles/(tutor|student)/classrooms/${classroom_id}/conference/access-tokens/`,
    method: HttpMethod.POST,
  },
  [CallsQueryKey.GetParticipants]: {
    getUrl: (classroom_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/conference-service/roles/(tutor|student)/classrooms/${classroom_id}/conference/participants/`,
    method: HttpMethod.GET,
  },
};

export { callsApiConfig, CallsQueryKey };
