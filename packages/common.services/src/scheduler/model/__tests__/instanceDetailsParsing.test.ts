import { describe, expect, it } from 'vitest';
import {
  extractInstanceSlot,
  normalizeEventInstanceDetailsResponse,
  readInstanceIsCancelled,
  readInstanceStartsAt,
} from '../instanceDetailsParsing';

describe('extractInstanceSlot', () => {
  it('читает nested persisted_event_instance', () => {
    expect(
      extractInstanceSlot({
        persisted_event_instance: {
          id: 'inst-1',
          starts_at: '2026-04-21T10:00:00Z',
          ends_at: '2026-04-21T11:00:00Z',
          cancelled_at: null,
        },
      }),
    ).toEqual({
      startsAt: '2026-04-21T10:00:00Z',
      endsAt: '2026-04-21T11:00:00Z',
      instanceId: 'inst-1',
      cancelledAt: null,
    });
  });

  it('читает nested virtual_event_instance', () => {
    expect(
      extractInstanceSlot({
        virtual_event_instance: {
          starts_at: '2026-04-22T10:00:00Z',
          ends_at: '2026-04-22T11:00:00Z',
        },
      }),
    ).toEqual({
      startsAt: '2026-04-22T10:00:00Z',
      endsAt: '2026-04-22T11:00:00Z',
      cancelledAt: null,
    });
  });

  it('читает legacy-плоский ответ', () => {
    expect(
      extractInstanceSlot({
        id: 'legacy-1',
        starts_at: '2026-04-23T10:00:00Z',
        ends_at: '2026-04-23T11:00:00Z',
        cancelled_at: '2026-04-23T09:00:00Z',
      }),
    ).toEqual({
      startsAt: '2026-04-23T10:00:00Z',
      endsAt: '2026-04-23T11:00:00Z',
      instanceId: 'legacy-1',
      cancelledAt: '2026-04-23T09:00:00Z',
    });
  });

  it('возвращает null без starts_at/ends_at', () => {
    expect(extractInstanceSlot({ name: 'без слота' })).toBeNull();
  });
});

describe('normalizeEventInstanceDetailsResponse', () => {
  it('нормализует nested + event', () => {
    expect(
      normalizeEventInstanceDetailsResponse({
        event: { name: 'Алгебра', description: 'Тема' },
        persisted_event_instance: {
          starts_at: '2026-04-21T10:00:00Z',
          ends_at: '2026-04-21T11:00:00Z',
        },
      } as never),
    ).toEqual({
      name: 'Алгебра',
      description: 'Тема',
      starts_at: '2026-04-21T10:00:00Z',
      ends_at: '2026-04-21T11:00:00Z',
    });
  });

  it('возвращает undefined для пустого ответа', () => {
    expect(normalizeEventInstanceDetailsResponse(undefined)).toBeUndefined();
    expect(normalizeEventInstanceDetailsResponse({} as never)).toBeUndefined();
  });
});

describe('readInstanceStartsAt', () => {
  it('парсит дату старта', () => {
    const date = readInstanceStartsAt({
      starts_at: '2026-04-21T10:00:00Z',
      ends_at: '2026-04-21T11:00:00Z',
    } as never);

    expect(date?.toISOString()).toBe('2026-04-21T10:00:00.000Z');
  });
});

describe('readInstanceIsCancelled', () => {
  it('читает cancelled_at из слота', () => {
    expect(
      readInstanceIsCancelled({
        persisted_event_instance: {
          starts_at: '2026-04-21T10:00:00Z',
          ends_at: '2026-04-21T11:00:00Z',
          cancelled_at: '2026-04-21T09:00:00Z',
        },
      }),
    ).toBe(true);
  });

  it('читает is_cancelled и status', () => {
    expect(readInstanceIsCancelled({ is_cancelled: true })).toBe(true);
    expect(readInstanceIsCancelled({ status: 'cancelled' })).toBe(true);
    expect(
      readInstanceIsCancelled({
        starts_at: '2026-04-21T10:00:00Z',
        ends_at: '2026-04-21T11:00:00Z',
      }),
    ).toBe(false);
  });
});
