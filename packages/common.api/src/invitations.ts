import { env } from 'common.env';
import { HttpMethod } from './config';

enum invitationsQueryKey {
  AllInvitations = 'AllInvitations',
  AddInvitation = 'AddInvitation',
  DeleteInvitation = 'DeleteInvitation',
}

const invitationsApiConfig = {
  [invitationsQueryKey.AllInvitations]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/invitations/`,
    method: HttpMethod.GET,
  },
  [invitationsQueryKey.AddInvitation]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/invitations/`,
    method: HttpMethod.POST,
  },
  [invitationsQueryKey.DeleteInvitation]: {
    getUrl: (invitation_id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/invitations/${invitation_id}/`,
    method: HttpMethod.DELETE,
  },
};

export { invitationsApiConfig, invitationsQueryKey };
