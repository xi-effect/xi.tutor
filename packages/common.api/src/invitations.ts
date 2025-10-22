import { env } from 'common.env';
import { HttpMethod } from './config';

enum InvitationsQueryKey {
  AllInvitations = 'AllInvitations',
  AddInvitation = 'AddInvitation',
  AddGroupInvitation = 'AddGroupInvitation',
  ResetGroupInvitation = 'ResetGroupInvitation',
  DeleteGroupInvitation = 'DeleteGroupInvitation',
  DeleteInvitation = 'DeleteInvitation',
}

const invitationsApiConfig = {
  [InvitationsQueryKey.AllInvitations]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/individual-invitations/`,
    method: HttpMethod.GET,
  },
  [InvitationsQueryKey.AddInvitation]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/individual-invitations/`,
    method: HttpMethod.POST,
  },
  [InvitationsQueryKey.AddGroupInvitation]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/invitation/`,
    method: HttpMethod.POST,
  },
  [InvitationsQueryKey.ResetGroupInvitation]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/invitation/`,
    method: HttpMethod.PUT,
  },
  [InvitationsQueryKey.DeleteGroupInvitation]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/invitation/`,
    method: HttpMethod.DELETE,
  },
  [InvitationsQueryKey.DeleteInvitation]: {
    getUrl: (invitation_id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/individual-invitations/${invitation_id}/`,
    method: HttpMethod.DELETE,
  },
};

export { invitationsApiConfig, InvitationsQueryKey };
