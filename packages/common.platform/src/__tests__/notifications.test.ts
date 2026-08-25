import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getNotificationPermission,
  isNotificationSupported,
  resetNotificationPermissionCache,
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
