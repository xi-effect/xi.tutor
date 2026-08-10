import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationT } from 'common.types';
import {
  formatNotificationCount,
  formatNotificationDate,
  getCustomNotificationModalPayload,
  getNotificationOpensModal,
  isCustomNotification,
} from '../notificationUtils';

const base = {
  actor_user_id: null,
  is_read: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} satisfies Omit<NotificationT, 'id' | 'payload'>;

describe('formatNotificationCount', () => {
  it('ограничивает счётчик 99+', () => {
    expect(formatNotificationCount(5)).toBe('5');
    expect(formatNotificationCount(99)).toBe('99');
    expect(formatNotificationCount(100)).toBe('99+');
  });
});

describe('custom notification helpers', () => {
  const custom: NotificationT = {
    ...base,
    id: 'n-1',
    payload: {
      kind: 'custom_v1',
      header: 'Заголовок',
      content: 'Текст',
      button_text: 'Открыть',
      button_link: '/payments',
    } as NotificationT['payload'],
  };

  it('распознаёт custom и достаёт payload модалки', () => {
    expect(isCustomNotification(custom)).toBe(true);
    expect(getCustomNotificationModalPayload(custom)).toEqual({
      header: 'Заголовок',
      content: 'Текст',
      button_text: 'Открыть',
      button_link: '/payments',
    });
    expect(getNotificationOpensModal(custom)).toBe(true);
  });

  it('для не-custom возвращает null/false', () => {
    const other: NotificationT = {
      ...base,
      id: 'n-2',
      payload: {
        kind: 'single_classroom_event_created_v1',
        classroom_id: 1,
        event_instance_id: 'x',
      },
    };
    expect(isCustomNotification(other)).toBe(false);
    expect(getCustomNotificationModalPayload(other)).toBeNull();
  });
});

describe('formatNotificationDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-21T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('форматирует относительное прошлое и будущее', () => {
    expect(formatNotificationDate('2026-04-21T11:30:00Z')).toBe('30 мин. назад');
    expect(formatNotificationDate('2026-04-21T14:00:00Z')).toBe('через 2 ч.');
  });
});
