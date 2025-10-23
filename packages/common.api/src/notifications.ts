import { env } from 'common.env';
import { HttpMethod } from './config';

enum NotificationsQueryKey {
  // Старые API для настроек
  NotificationsSettings = 'NotificationsSettings',
  ContactsVisibility = 'ContactsVisibility',
  GetContacts = 'GetContacts',

  // Новые API для уведомлений
  GetNotifications = 'GetNotifications',
  GetNotificationCount = 'GetNotificationCount',
  MarkAsRead = 'MarkAsRead',
  MarkAllAsRead = 'MarkAllAsRead',
  DeleteNotification = 'DeleteNotification',
}

const notificationsApiConfig = {
  // Старые API для настроек
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

  // Новые API для уведомлений
  [NotificationsQueryKey.GetNotifications]: {
    getUrl: (cursor?: string) => {
      const baseUrl = `${env.VITE_SERVER_URL_BACKEND}/api/protected/notifications/`;
      return cursor ? `${baseUrl}?cursor=${cursor}` : baseUrl;
    },
    method: HttpMethod.GET,
  },
  [NotificationsQueryKey.GetNotificationCount]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/notifications/count/`,
    method: HttpMethod.GET,
  },
  [NotificationsQueryKey.MarkAsRead]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notifications/${id}/read/`,
    method: HttpMethod.POST,
  },
  [NotificationsQueryKey.MarkAllAsRead]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/notifications/read-all/`,
    method: HttpMethod.POST,
  },
  [NotificationsQueryKey.DeleteNotification]: {
    getUrl: (id: string) => `${env.VITE_SERVER_URL_BACKEND}/api/protected/notifications/${id}/`,
    method: HttpMethod.DELETE,
  },
};

export { notificationsApiConfig, NotificationsQueryKey };
