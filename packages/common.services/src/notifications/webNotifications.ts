/**
 * Системные уведомления (Web Notifications API).
 * Работают в браузере (в т.ч. в другой вкладке) и в установленном PWA.
 * Используются вместо toast, когда пользователь выдал разрешение и включил настройку.
 */

const STORAGE_KEY = 'pwa.notifications.enabled';

const isBrowser = typeof window !== 'undefined';

/** Приложение запущено как установленное PWA (standalone) */
export const isPWA = (): boolean => {
  if (!isBrowser) return false;
  const mode = window.matchMedia('(display-mode: standalone)').matches;
  const standalone = (navigator as { standalone?: boolean }).standalone;
  const referrer = document.referrer.includes('android-app://');
  return Boolean(mode || standalone || referrer);
};

/** Web Notifications API доступен */
export const isNotificationAPIAvailable = (): boolean =>
  isBrowser && typeof Notification !== 'undefined';

/** Текущее разрешение на уведомления */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationAPIAvailable()) return 'denied';
  return Notification.permission;
};

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
 * Нужно ли показывать входящие уведомления через Web API вместо toast:
 * API доступен + разрешение выдано + настройка включена (работает и в вкладке, и в PWA).
 */
export const shouldUseSystemNotifications = (): boolean =>
  isNotificationAPIAvailable() &&
  getNotificationPermission() === 'granted' &&
  getSystemNotificationsEnabled();

export interface ShowSystemNotificationOptions {
  title: string;
  body: string;
  /** URL для перехода по клику (относительный или абсолютный) */
  url?: string | null;
  /** Вызывается при клике по уведомлению (фокус окна + навигация) */
  onNavigate?: (url: string) => void;
}

/**
 * Показывает системное уведомление. Вызывать только если shouldUseSystemNotifications() === true.
 */
export const showSystemNotification = (options: ShowSystemNotificationOptions): void => {
  const { title, body, url, onNavigate } = options;
  if (!isNotificationAPIAvailable() || getNotificationPermission() !== 'granted') {
    return;
  }
  try {
    const notification = new Notification(title, {
      body,
      icon: '/web-app-manifest-192x192.png',
      tag: `sovlium-${Date.now()}`, // разный tag, чтобы каждое уведомление показывалось
    });
    notification.onclick = () => {
      window.focus();
      if (url && onNavigate) {
        onNavigate(url);
      }
      notification.close();
    };
  } catch {
    // игнорируем (браузер/ОС не показали уведомление)
  }
};

/**
 * Показывает тестовое системное уведомление (для проверки на localhost и в браузере).
 * Работает только при выданном разрешении.
 */
export const showTestSystemNotification = (): boolean => {
  if (!isNotificationAPIAvailable() || getNotificationPermission() !== 'granted') {
    return false;
  }
  try {
    showSystemNotification({
      title: 'Тест уведомлений',
      body: 'Если вы видите это — системные уведомления работают.',
    });
    return true;
  } catch {
    return false;
  }
};
