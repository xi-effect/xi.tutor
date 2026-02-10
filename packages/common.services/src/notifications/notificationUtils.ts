import type { NotificationT } from 'common.types';
import { notificationConfigs } from './notificationConfig';

/**
 * Генерирует заголовок уведомления на основе kind и payload
 */
export const generateNotificationTitle = (notification: NotificationT): string => {
  if (!notification?.payload) {
    return 'Уведомление';
  }

  const { kind } = notification.payload;
  const config = notificationConfigs[kind];

  if (!config) {
    return 'Уведомление';
  }

  const title = config.title;
  if (typeof title === 'function') {
    return title(notification.payload);
  }

  return title;
};

/**
 * Генерирует описание уведомления на основе kind и payload
 */
export const generateNotificationDescription = (notification: NotificationT): string => {
  if (!notification?.payload) {
    return 'Новое уведомление';
  }

  const { kind } = notification.payload;
  const config = notificationConfigs[kind];

  if (!config) {
    return 'Новое уведомление';
  }

  return config.description(notification.payload);
};

/**
 * Генерирует ссылку для перехода при клике на уведомление
 */
export const generateNotificationAction = (notification: NotificationT): string | null => {
  if (!notification?.payload) {
    return null;
  }

  const { kind } = notification.payload;
  const config = notificationConfigs[kind];

  if (!config) {
    return null;
  }

  return config.action(notification.payload);
};

/**
 * Получает ключи для ревалидации кеша React Query для уведомления
 */
export const getNotificationInvalidationKeys = (
  notification: NotificationT,
): Array<string | [string, ...unknown[]]> => {
  if (!notification?.payload) {
    return [];
  }

  const { kind } = notification.payload;
  const config = notificationConfigs[kind];

  if (!config) {
    return [];
  }

  return config.invalidationKeys;
};

/**
 * Форматирует дату для отображения
 */
export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInMinutes = Math.round(diffInMs / (1000 * 60));
  const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  // Если дата в будущем
  if (diffInMs > 0) {
    if (diffInMinutes < 60) {
      return `через ${diffInMinutes} мин.`;
    } else if (diffInHours < 24) {
      return `через ${diffInHours} ч.`;
    } else {
      return `через ${diffInDays} дн.`;
    }
  }

  // Если дата в прошлом
  if (Math.abs(diffInMinutes) === 0) {
    return 'меньше минуты назад';
  } else if (Math.abs(diffInMinutes) < 60) {
    return `${Math.abs(diffInMinutes)} мин. назад`;
  } else if (Math.abs(diffInHours) < 24) {
    return `${Math.abs(diffInHours)} ч. назад`;
  } else if (Math.abs(diffInDays) < 7) {
    return `${Math.abs(diffInDays)} дн. назад`;
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
};

/**
 * Форматирует полную дату для tooltip
 */
export const formatFullNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Ограничивает счетчик уведомлений до 99+
 */
export const formatNotificationCount = (count: number): string => {
  return count > 99 ? '99+' : count.toString();
};

/**
 * Проверяет, является ли уведомление кастомным (открывается модалка вместо перехода)
 */
export const isCustomNotification = (notification: NotificationT): boolean => {
  return notification?.payload?.kind === 'custom_v1';
};

/**
 * Данные для модалки кастомного уведомления (header, content, button_text, button_link)
 */
export type CustomNotificationModalPayload = {
  header: string;
  content: string;
  button_text: string;
  button_link: string;
};

/**
 * Извлекает payload для модалки кастомного уведомления; возвращает null, если не custom_v1
 */
export const getCustomNotificationModalPayload = (
  notification: NotificationT,
): CustomNotificationModalPayload | null => {
  if (!isCustomNotification(notification) || !notification.payload) return null;
  const p = notification.payload as Record<string, unknown>;
  const header = typeof p.header === 'string' ? p.header : '';
  const content = typeof p.content === 'string' ? p.content : '';
  const button_text = typeof p.button_text === 'string' ? p.button_text : '';
  const button_link = typeof p.button_link === 'string' ? p.button_link : '';
  return { header, content, button_text, button_link };
};

/**
 * Возвращает true, если по клику на уведомление нужно открыть модалку (а не переходить по ссылке)
 */
export const getNotificationOpensModal = (notification: NotificationT): boolean => {
  if (!notification?.payload) return false;
  const config = notificationConfigs[notification.payload.kind];
  return Boolean(config?.opensModal);
};
