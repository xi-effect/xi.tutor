import { env } from 'common.env';
import { HttpMethod } from './config';

enum InvitationsQueryKey {
  AllInvitations = 'AllInvitations',
  AddInvitation = 'AddInvitation',
  DeleteInvitation = 'DeleteInvitation',
}

const invitationsApiConfig = {
  [InvitationsQueryKey.AllInvitations]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/invitations/`,
    method: HttpMethod.GET,
  },
  [InvitationsQueryKey.AddInvitation]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/invitations/`,
    method: HttpMethod.POST,
  },
  [InvitationsQueryKey.DeleteInvitation]: {
    getUrl: (invitation_id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/invitations/${invitation_id}/`,
    method: HttpMethod.DELETE,
  },
};

export { invitationsApiConfig, InvitationsQueryKey };
