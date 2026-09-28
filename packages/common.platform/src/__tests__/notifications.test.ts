import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getNotificationPermission,
  isNotificationSupported,
  refreshNotificationPermission,
  resetNotificationPermissionCache,
  showNotification,
} from '../notifications';

describe('notifications (web)', () => {
  afterEach(() => {
    resetNotificationPermissionCache();
    vi.unstubAllGlobals();
  });

  it('без Notification API считает, что системные уведомления недоступны', () => {
    expect(isNotificationSupported()).toBe(false);
    expect(getNotificationPermission()).toBe('denied');
  });

  it('читает Permission из Web Notification API', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('Notification', { permission: 'granted' });

    expect(isNotificationSupported()).toBe(true);
    expect(getNotificationPermission()).toBe('granted');
  });
});

describe('notifications (electron)', () => {
  afterEach(() => {
    resetNotificationPermissionCache();
    vi.unstubAllGlobals();
  });

  it('не берёт Chromium Notification.permission и читает статус оболочки', async () => {
    vi.stubGlobal('window', {
      __SOVLIUM_ELECTRON__: true,
      sovliumDesktop: {
        notifications: {
          status: vi.fn(async () => 'granted'),
          request: vi.fn(async () => 'granted'),
          show: vi.fn(async () => true),
        },
      },
    });
    vi.stubGlobal('Notification', { permission: 'denied' });

    expect(isNotificationSupported()).toBe(true);
    expect(getNotificationPermission()).toBe('default');
    expect(await refreshNotificationPermission()).toBe('granted');
    expect(getNotificationPermission()).toBe('granted');
    expect(await showNotification({ title: 'Test', body: 'Body', url: '/payments' })).toBe(true);
  });
});
