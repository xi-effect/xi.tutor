import { isDesktopNative, isElectronShell, isNativeShell, isTauriShell } from './detect';
import { getSovliumDesktop } from './electron';
import { focusAppWindow } from './window';

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

function mapPluginPermission(status: string, granted: boolean): NotificationPermissionState {
  if (granted || status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'default';
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

  if (isTauriShell()) {
    try {
      const plugin = await import('@tauri-apps/plugin-notification');
      const granted = await plugin.isPermissionGranted();
      cachedPermission = granted ? 'granted' : 'default';
      cacheHydrated = true;
      return cachedPermission;
    } catch (err) {
      console.warn('[common.platform] notification permission query failed', err);
      if (webNotificationAvailable()) {
        cachedPermission = Notification.permission;
        cacheHydrated = true;
        return cachedPermission;
      }
      cachedPermission = 'denied';
      cacheHydrated = true;
      return cachedPermission;
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

  if (isTauriShell()) {
    try {
      const plugin = await import('@tauri-apps/plugin-notification');
      let granted = await plugin.isPermissionGranted();
      if (!granted) {
        const status = await plugin.requestPermission();
        granted = status === 'granted';
        cachedPermission = mapPluginPermission(String(status), granted);
      } else {
        cachedPermission = 'granted';
      }
      cacheHydrated = true;
      return cachedPermission;
    } catch (err) {
      console.warn('[common.platform] notification permission request failed', err);
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

const pendingByTag = new Map<string, ShowNotificationOptions>();
let actionListenerInstalled = false;

async function ensureNotificationActionListener(): Promise<void> {
  if (actionListenerInstalled || !isTauriShell()) return;
  actionListenerInstalled = true;
  try {
    const { onAction } = await import('@tauri-apps/plugin-notification');
    await onAction((event) => {
      const extra = event.extra as { tag?: string; url?: string } | undefined;
      const tag = extra?.tag;
      const pending = tag ? pendingByTag.get(tag) : undefined;
      const url = extra?.url ?? pending?.url;
      void focusAppWindow();
      if (url && pending?.onNavigate) {
        pending.onNavigate(url);
      }
      if (tag) pendingByTag.delete(tag);
    });
  } catch {
    // Older plugin builds may not expose onAction.
  }
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

  if (isTauriShell()) {
    try {
      await ensureNotificationActionListener();
      const plugin = await import('@tauri-apps/plugin-notification');
      const tag = `sovlium-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      pendingByTag.set(tag, options);
      await plugin.sendNotification({
        title,
        body,
        extra: { tag, url: url ?? '' },
      });
      return true;
    } catch (err) {
      console.warn('[common.platform] native notification failed, falling back', err);
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
  pendingByTag.clear();
  actionListenerInstalled = false;
}

export function isDesktopNotificationsPreferred(): boolean {
  return isDesktopNative();
}
