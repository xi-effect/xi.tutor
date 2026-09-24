import { isDesktopNative, isElectronShell, isNativeShell } from './detect';
import { getSovliumDesktop } from './electron';

export type NotificationPermissionState = NotificationPermission;

let cachedPermission: NotificationPermissionState = 'default';
let cacheHydrated = false;

function webNotificationAvailable(): boolean {
  return typeof window !== 'undefined' && typeof Notification !== 'undefined';
}

export function isNotificationSupported(): boolean {
  if (isNativeShell()) return true;
  return webNotificationAvailable();
}

export function getNotificationPermission(): NotificationPermissionState {
  if (isElectronShell()) {
    if (!isNotificationSupported()) return 'denied';
    return cacheHydrated ? cachedPermission : 'default';
  }
  if (!cacheHydrated && webNotificationAvailable()) {
    cachedPermission = Notification.permission;
    cacheHydrated = true;
  }
  if (!isNotificationSupported()) return 'denied';
  return cachedPermission;
}

export async function refreshNotificationPermission(): Promise<NotificationPermissionState> {
  if (isElectronShell()) {
    try {
      const status = await getSovliumDesktop()?.notifications.status();
      cachedPermission =
        status === 'denied' ? 'denied' : status === 'granted' ? 'granted' : 'default';
      cacheHydrated = true;
      return cachedPermission;
    } catch (err) {
      console.warn('[common.platform] electron notification status failed', err);
    }
  }

  if (!webNotificationAvailable()) {
    cachedPermission = 'denied';
    cacheHydrated = true;
    return cachedPermission;
  }
  cachedPermission = Notification.permission;
  cacheHydrated = true;
  return cachedPermission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (isElectronShell()) {
    try {
      const status = await getSovliumDesktop()?.notifications.request();
      cachedPermission =
        status === 'denied' ? 'denied' : status === 'granted' ? 'granted' : 'default';
      cacheHydrated = true;
      return cachedPermission;
    } catch (err) {
      console.warn('[common.platform] electron notification request failed', err);
    }
  }

  if (!webNotificationAvailable()) {
    cachedPermission = 'denied';
    cacheHydrated = true;
    return cachedPermission;
  }
  const result = await Notification.requestPermission();
  cachedPermission = result;
  cacheHydrated = true;
  return result;
}

export interface ShowNotificationOptions {
  title: string;
  body: string;
  url?: string | null;
  onNavigate?: (url: string) => void;
  icon?: string;
}

export async function showNotification(options: ShowNotificationOptions): Promise<boolean> {
  const { title, body, url, onNavigate, icon } = options;
  const permission = await refreshNotificationPermission();
  if (permission !== 'granted') return false;

  if (isElectronShell()) {
    try {
      const shown = await getSovliumDesktop()?.notifications.show({
        title,
        body,
        url: url ?? undefined,
      });
      if (shown) return true;
    } catch (err) {
      console.warn('[common.platform] electron notification failed, falling back', err);
    }
  }

  if (!webNotificationAvailable()) return false;
  try {
    const notification = new Notification(title, {
      body,
      icon: icon ?? '/web-app-manifest-192x192.png',
      tag: `sovlium-${Date.now()}`,
    });
    notification.onclick = () => {
      window.focus();
      if (url && onNavigate) onNavigate(url);
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}

/** @internal tests */
export function resetNotificationPermissionCache(): void {
  cachedPermission = 'default';
  cacheHydrated = false;
}

export function isDesktopNotificationsPreferred(): boolean {
  return isDesktopNative();
}
