import { Notification } from 'electron';
import type { DesktopNotificationPermission } from '../shared/types';

const active = new Set<Notification>();

export function isNativeNotificationSupported(): boolean {
  return Notification.isSupported();
}

export function getNativeNotificationPermission(): DesktopNotificationPermission {
  return Notification.isSupported() ? 'granted' : 'denied';
}

export function requestNativeNotificationPermission(): DesktopNotificationPermission {
  return getNativeNotificationPermission();
}

export function showNativeNotification(
  options: { title: string; body: string; url?: string },
  onClick: (url: string) => void,
): boolean {
  if (!Notification.isSupported()) return false;

  const notification = new Notification({
    title: options.title,
    body: options.body,
  });
  active.add(notification);

  const release = () => {
    active.delete(notification);
  };

  notification.on('click', () => {
    release();
    onClick(options.url ?? '');
  });
  notification.on('close', release);
  notification.on('failed', release);
  notification.show();
  return true;
}
