import { env } from 'common.env';
import { HttpMethod } from './config';

enum NotificationsQueryKey {
  // API для настроек
  NotificationsSettings = 'NotificationsSettings',
  ContactsVisibility = 'ContactsVisibility',
  GetContacts = 'GetContacts',

  // API для уведомлений (новый контракт)
  SearchNotifications = 'SearchNotifications',
  GetUnreadCount = 'GetUnreadCount',
  MarkAsRead = 'MarkAsRead',
}

const notificationsApiConfig = {
  // API для настроек
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

  // API для уведомлений (новый контракт)
  [NotificationsQueryKey.SearchNotifications]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/notifications/searches/`,
    method: HttpMethod.POST,
  },
  [NotificationsQueryKey.GetUnreadCount]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/unread-notifications-count/`,
    method: HttpMethod.GET,
  },
  [NotificationsQueryKey.MarkAsRead]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/notifications/${id}/read/`,
    method: HttpMethod.POST,
  },
};

export { notificationsApiConfig, NotificationsQueryKey };
