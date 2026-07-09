import { env } from 'common.env';
import { HttpMethod } from './config';

enum NotificationsQueryKey {
  DeliveryMethods = 'DeliveryMethods',
  ContactsVisibility = 'ContactsVisibility',

  // API для уведомлений (новый контракт)
  SearchNotifications = 'SearchNotifications',
  GetUnreadCount = 'GetUnreadCount',
  MarkAsRead = 'MarkAsRead',
}

const deliveryMethodsBaseUrl = `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/delivery-methods`;

const notificationsApiConfig = {
  [NotificationsQueryKey.DeliveryMethods]: {
    getUrl: () => `${deliveryMethodsBaseUrl}/`,
    method: HttpMethod.GET,
  },
  [NotificationsQueryKey.ContactsVisibility]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/contacts/personal-telegram/visibility/`,
    method: HttpMethod.PUT,
  },
  CreateTgConnection: {
    getUrl: () => `${deliveryMethodsBaseUrl}/telegram/connection-requests/`,
    method: HttpMethod.POST,
  },
  CreateVkConnection: {
    getUrl: () => `${deliveryMethodsBaseUrl}/vk/connection-requests/`,
    method: HttpMethod.POST,
  },
  DeleteDeliveryMethod: {
    getUrl: (deliveryMethodKind: 'telegram' | 'vk') =>
      `${deliveryMethodsBaseUrl}/${deliveryMethodKind}/`,
    method: HttpMethod.DELETE,
  },
  EnableNotificationGroup: {
    getUrl: (deliveryMethodKind: string, notificationGroupKind: string) =>
      `${deliveryMethodsBaseUrl}/${deliveryMethodKind}/enabled-notification-groups/${notificationGroupKind}/`,
    method: HttpMethod.PUT,
  },
  DisableNotificationGroup: {
    getUrl: (deliveryMethodKind: string, notificationGroupKind: string) =>
      `${deliveryMethodsBaseUrl}/${deliveryMethodKind}/enabled-notification-groups/${notificationGroupKind}/`,
    method: HttpMethod.DELETE,
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
