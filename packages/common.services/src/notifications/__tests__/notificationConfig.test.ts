import { describe, expect, it } from 'vitest';
import type { NotificationT } from 'common.types';
import {
  generateNotificationAction,
  generateNotificationDescription,
  generateNotificationTitle,
} from '../notificationUtils';

const REMINDER_TITLE = 'Занятие скоро начнётся';
const REMINDER_DESCRIPTION = 'Нажмите, чтобы узнать подробности';
const REMINDER_FULL_TEXT = `${REMINDER_TITLE}. ${REMINDER_DESCRIPTION}`;

const baseNotification = {
  actor_user_id: null,
  is_read: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} satisfies Omit<NotificationT, 'id' | 'payload'>;

const persistedReminderNotification: NotificationT = {
  ...baseNotification,
  id: '00000000-0000-0000-0000-000000000001',
  payload: {
    kind: 'persisted_classroom_event_instance_reminder_v1',
    classroom_id: 123,
    event_instance_id: '11111111-1111-1111-1111-111111111111',
  },
};

const repeatedReminderNotification: NotificationT = {
  ...baseNotification,
  id: '00000000-0000-0000-0000-000000000002',
  payload: {
    kind: 'repeated_classroom_event_instance_reminder_v1',
    classroom_id: 123,
    repetition_mode_id: '22222222-2222-2222-2222-222222222222',
    instance_index: 3,
  },
};

const singleCreatedNotification: NotificationT = {
  ...baseNotification,
  id: '00000000-0000-0000-0000-000000000003',
  payload: {
    kind: 'single_classroom_event_created_v1',
    classroom_id: 456,
    event_instance_id: '33333333-3333-3333-3333-333333333333',
  },
};

const repeatingCreatedNotification: NotificationT = {
  ...baseNotification,
  id: '00000000-0000-0000-0000-000000000004',
  payload: {
    kind: 'repeating_classroom_event_created_v1',
    classroom_id: 789,
    focused_at: '2026-06-14T10:00:00.000Z',
  },
};

const formatNotificationText = (notification: NotificationT): string => {
  const title = generateNotificationTitle(notification);
  const description = generateNotificationDescription(notification);
  return description ? `${title}. ${description}` : title;
};

describe('classroom reminder notifications', () => {
  it('persisted_classroom_event_instance_reminder_v1 отображает ожидаемый текст', () => {
    expect(generateNotificationTitle(persistedReminderNotification)).toBe(REMINDER_TITLE);
    expect(generateNotificationDescription(persistedReminderNotification)).toBe(
      REMINDER_DESCRIPTION,
    );
    expect(formatNotificationText(persistedReminderNotification)).toBe(REMINDER_FULL_TEXT);
  });

  it('repeated_classroom_event_instance_reminder_v1 отображает ожидаемый текст', () => {
    expect(generateNotificationTitle(repeatedReminderNotification)).toBe(REMINDER_TITLE);
    expect(generateNotificationDescription(repeatedReminderNotification)).toBe(
      REMINDER_DESCRIPTION,
    );
    expect(formatNotificationText(repeatedReminderNotification)).toBe(REMINDER_FULL_TEXT);
  });

  it('клик по persisted reminder строит ссылку с classroom_id и event_instance_id', () => {
    const url = generateNotificationAction(persistedReminderNotification);
    expect(url).toBe(
      '/classrooms/123?tab=schedule&event_instance_id=11111111-1111-1111-1111-111111111111',
    );
  });

  it('клик по repeated reminder строит ссылку с classroom_id, repetition_mode_id и instance_index', () => {
    const url = generateNotificationAction(repeatedReminderNotification);
    expect(url).toBe(
      '/classrooms/123?tab=schedule&repetition_mode_id=22222222-2222-2222-2222-222222222222&instance_index=3',
    );
  });

  it('не выполняет переход при неполном persisted payload', () => {
    const incomplete: NotificationT = {
      ...persistedReminderNotification,
      payload: {
        kind: 'persisted_classroom_event_instance_reminder_v1',
        classroom_id: 123,
        event_instance_id: '',
      },
    };

    expect(generateNotificationAction(incomplete)).toBeNull();
  });

  it('не выполняет переход при неполном repeated payload', () => {
    const incomplete: NotificationT = {
      ...repeatedReminderNotification,
      payload: {
        kind: 'repeated_classroom_event_instance_reminder_v1',
        classroom_id: 123,
        repetition_mode_id: '',
        instance_index: 3,
      },
    };

    expect(generateNotificationAction(incomplete)).toBeNull();
  });
});

describe('existing schedule notifications', () => {
  it('single_classroom_event_created_v1 продолжает работать без изменений', () => {
    expect(generateNotificationTitle(singleCreatedNotification)).toBe('Новое занятие в расписании');
    expect(generateNotificationDescription(singleCreatedNotification)).toBe(
      'Нажмите, чтобы узнать подробности',
    );
    expect(generateNotificationAction(singleCreatedNotification)).toBe(
      '/classrooms/456?tab=schedule&event_instance_id=33333333-3333-3333-3333-333333333333',
    );
  });

  it('repeating_classroom_event_created_v1 продолжает работать без изменений', () => {
    expect(generateNotificationTitle(repeatingCreatedNotification)).toBe(
      'В ваше расписание добавлены новые регулярные занятия',
    );
    expect(generateNotificationAction(repeatingCreatedNotification)).toBe(
      '/classrooms/789?tab=schedule&focused_at=2026-06-14T10%3A00%3A00.000Z',
    );
  });
});
