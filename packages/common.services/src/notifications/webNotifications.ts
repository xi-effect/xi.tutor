/**
 * Системные уведомления.
 * В браузере / PWA — Web Notifications API.
 * В Tauri (macOS / Windows) — `@tauri-apps/plugin-notification`.
 */

import {
  getNotificationPermission as getPlatformNotificationPermission,
  isNativeShell,
  isNotificationSupported,
  refreshNotificationPermission,
  requestNotificationPermission,
  showNotification,
  type ShowNotificationOptions,
} from 'common.platform';

const STORAGE_KEY = 'pwa.notifications.enabled';

const isBrowser = typeof window !== 'undefined';

/** Приложение запущено как установленное PWA (standalone). В native shell — false. */
export const isPWA = (): boolean => {
  if (!isBrowser || isNativeShell()) return false;
  const mode = window.matchMedia('(display-mode: standalone)').matches;
  const standalone = (navigator as { standalone?: boolean }).standalone;
  const referrer = document.referrer.includes('android-app://');
  return Boolean(mode || standalone || referrer);
};

/** Системные уведомления доступны (Web API или native plugin). */
export const isNotificationAPIAvailable = (): boolean => isNotificationSupported();

/** Текущее (кэшированное) разрешение на уведомления */
export const getNotificationPermission = (): NotificationPermission =>
  getPlatformNotificationPermission();

export { refreshNotificationPermission, requestNotificationPermission };

/** Включены ли системные уведомления в настройках пользователя (localStorage) */
export const getSystemNotificationsEnabled = (): boolean => {
  if (!isBrowser) return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setSystemNotificationsEnabled = (enabled: boolean): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
};

/**
 * Нужно ли показывать входящие уведомления через системный канал вместо toast:
 * API доступен + разрешение выдано + настройка включена.
 */
export const shouldUseSystemNotifications = (): boolean =>
  isNotificationAPIAvailable() &&
  getNotificationPermission() === 'granted' &&
  getSystemNotificationsEnabled();

export type ShowSystemNotificationOptions = ShowNotificationOptions;

/**
 * Показывает системное уведомление. Вызывать только если shouldUseSystemNotifications() === true.
 */
export const showSystemNotification = (options: ShowSystemNotificationOptions): void => {
  void showNotification(options);
};

/**
 * Показывает тестовое системное уведомление.
 * Работает только при выданном разрешении.
 */
export const showTestSystemNotification = async (): Promise<boolean> => {
  if (!isNotificationAPIAvailable()) return false;
  const permission = await refreshNotificationPermission();
  if (permission !== 'granted') return false;
  return showNotification({
    title: 'Тест уведомлений',
    body: 'Если вы видите это — системные уведомления работают.',
  });
};
