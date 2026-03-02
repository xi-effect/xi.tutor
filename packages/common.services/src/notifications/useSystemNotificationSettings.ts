import { useCallback, useEffect, useState } from 'react';
import {
  getNotificationPermission,
  getSystemNotificationsEnabled,
  isNotificationAPIAvailable,
  isPWA,
  setSystemNotificationsEnabled as setStorageEnabled,
  shouldUseSystemNotifications,
} from './webNotifications';

export type SystemNotificationPermission = NotificationPermission;

export interface UseSystemNotificationSettingsReturn {
  /** Приложение запущено как PWA */
  isPWA: boolean;
  /** Web Notifications API доступен */
  isSupported: boolean;
  /** Можно ли использовать системные уведомления (PWA + разрешение + включено) */
  canUse: boolean;
  /** Текущее разрешение браузера */
  permission: SystemNotificationPermission;
  /** Включены ли системные уведомления в настройках */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  /** Запросить разрешение у пользователя. Возвращает новое значение permission. */
  requestPermission: () => Promise<SystemNotificationPermission>;
}

export const useSystemNotificationSettings = (): UseSystemNotificationSettingsReturn => {
  const [permission, setPermission] = useState<SystemNotificationPermission>(() =>
    getNotificationPermission(),
  );
  const [enabled, setEnabledState] = useState<boolean>(() => getSystemNotificationsEnabled());

  useEffect(() => {
    setPermission(getNotificationPermission());
    setEnabledState(getSystemNotificationsEnabled());
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setStorageEnabled(value);
    setEnabledState(value);
  }, []);

  const requestPermission = useCallback(async (): Promise<SystemNotificationPermission> => {
    if (!isNotificationAPIAvailable() || permission === 'granted') {
      return permission;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [permission]);

  const pwa = isPWA();
  const supported = isNotificationAPIAvailable();
  const canUse = shouldUseSystemNotifications();

  return {
    isPWA: pwa,
    isSupported: supported,
    canUse,
    permission,
    enabled,
    setEnabled,
    requestPermission,
  };
};
