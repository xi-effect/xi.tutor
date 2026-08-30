import { useCallback, useEffect, useState } from 'react';
import { refreshNotificationPermission } from 'common.platform';
import {
  getNotificationPermission,
  getSystemNotificationsEnabled,
  isNotificationAPIAvailable,
  isPWA,
  setSystemNotificationsEnabled as setStorageEnabled,
  shouldUseSystemNotifications,
  requestNotificationPermission,
} from './webNotifications';

export type SystemNotificationPermission = NotificationPermission;

export interface UseSystemNotificationSettingsReturn {
  /** Приложение запущено как PWA */
  isPWA: boolean;
  /** Системные уведомления доступны (Web API или native plugin) */
  isSupported: boolean;
  /** Можно ли использовать системные уведомления (разрешение + включено) */
  canUse: boolean;
  /** Текущее разрешение */
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
    setEnabledState(getSystemNotificationsEnabled());
    void refreshNotificationPermission().then(setPermission);
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setStorageEnabled(value);
    setEnabledState(value);
  }, []);

  const requestPermission = useCallback(async (): Promise<SystemNotificationPermission> => {
    if (!isNotificationAPIAvailable() || permission === 'granted') {
      return permission;
    }
    const result = await requestNotificationPermission();
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
