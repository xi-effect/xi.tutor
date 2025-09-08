import { env } from 'common.env';
import { HttpMethod } from './config';

enum NotificationsQueryKey {
  NotificationsSettings = 'NotificationsSettings',
  ContactsVisibility = 'ContactsVisibility',
  GetContacts = 'GetContacts',
}

const notificationsApiConfig = {
  [NotificationsQueryKey.NotificationsSettings]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/notification-settings/`,
    method: HttpMethod.GET,
  },
  [NotificationsQueryKey.ContactsVisibility]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/contacts/personal-telegram/visibility/`,
    method: HttpMethod.PUT,
  },
  [NotificationsQueryKey.GetContacts]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/contacts/`,
    method: HttpMethod.GET,
  },
};

export { notificationsApiConfig, NotificationsQueryKey };
