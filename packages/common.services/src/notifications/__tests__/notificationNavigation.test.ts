import { describe, expect, it } from 'vitest';
import { buildNotificationHref, parseNotificationUrl } from '../notificationNavigation';

describe('parseNotificationUrl', () => {
  it('парсит относительный путь кабинета', () => {
    expect(parseNotificationUrl('/classrooms/42')).toEqual({
      to: '/classrooms/$classroomId',
      params: { classroomId: '42' },
      search: undefined,
    });
  });

  it('парсит кабинет с query', () => {
    expect(parseNotificationUrl('/classrooms/7?tab=payments')).toEqual({
      to: '/classrooms/$classroomId',
      params: { classroomId: '7' },
      search: { tab: 'payments' },
    });
  });

  it('сохраняет role из ссылки уведомления', () => {
    expect(parseNotificationUrl('/classrooms/7?role=student&goto=call')).toEqual({
      to: '/classrooms/$classroomId',
      params: { classroomId: '7' },
      search: { role: 'student', goto: 'call' },
    });
  });

  it('сохраняет role на /payments', () => {
    expect(parseNotificationUrl('/payments?role=tutor&tab=invoices')).toEqual({
      to: '/payments',
      search: { role: 'tutor', tab: 'invoices' },
    });
  });

  it('парсит /payments', () => {
    expect(parseNotificationUrl('/payments')).toEqual({
      to: '/payments',
      search: undefined,
    });
  });

  it('парсит абсолютный in-app URL', () => {
    expect(parseNotificationUrl('https://app.sovlium.ru/classrooms/15/')).toEqual({
      to: '/classrooms/$classroomId',
      params: { classroomId: '15' },
      search: undefined,
    });
  });

  it('помечает внешние URL как external', () => {
    expect(parseNotificationUrl('https://example.com/other')).toBe('external');
  });

  it('возвращает null для неизвестных внутренних путей', () => {
    expect(parseNotificationUrl('/settings')).toBeNull();
  });
});

describe('buildNotificationHref', () => {
  it('собирает путь кабинета с query', () => {
    expect(
      buildNotificationHref({
        to: '/classrooms/$classroomId',
        params: { classroomId: '9' },
        search: { tab: 'notes' },
      }),
    ).toBe('/classrooms/9?tab=notes');
  });

  it('собирает /payments без query', () => {
    expect(buildNotificationHref({ to: '/payments' })).toBe('/payments');
  });
});
