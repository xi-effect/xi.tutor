import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScheduleItem } from 'common.services';
import {
  getScheduleQueryRange,
  mapScheduleItemToCalendarEvent,
} from '../scheduleMapping';
import { toLocalISOString } from '../dateTimezone';

const makeSoleItem = (overrides: Partial<ScheduleItem> = {}): ScheduleItem =>
  ({
    eventId: 10,
    startsAt: '2026-04-21T10:00:00+03:00',
    endsAt: '2026-04-21T11:00:00+03:00',
    title: 'Алгебра',
    description: 'Тема',
    classroomId: 5,
    event: undefined,
    repetitionMode: undefined,
    instanceKind: 'sole',
    repetitionKind: null,
    instanceIndex: null,
    cancelledAt: null,
    isSingle: true,
    isRepeatedVirtual: false,
    isRepeatedPersistent: false,
    eventInstance: {
      id: 'inst-1',
      cancelled_at: null,
      event_id: 10,
      starts_at: '2026-04-21T10:00:00+03:00',
      ends_at: '2026-04-21T11:00:00+03:00',
      name: 'Алгебра',
      description: 'Тема',
      kind: 'sole',
    },
    ...overrides,
  }) as ScheduleItem;

describe('mapScheduleItemToCalendarEvent', () => {
  it('маппит sole-элемент в событие календаря', () => {
    const event = mapScheduleItemToCalendarEvent(makeSoleItem());

    expect(event.id).toBe('inst-1');
    expect(event.title).toBe('Алгебра');
    expect(event.type).toBe('lesson');
    expect(event.isCancelled).toBe(false);
    expect(event.lessonInfo?.classroomId).toBe(5);
    expect(event.scheduler).toMatchObject({
      eventId: 10,
      eventInstanceId: 'inst-1',
      instanceKind: 'sole',
      startsAt: '2026-04-21T10:00:00+03:00',
    });
  });

  it('проставляет isCancelled и weeklyBitmask для weekly серии', () => {
    const event = mapScheduleItemToCalendarEvent(
      makeSoleItem({
        cancelledAt: '2026-04-20T10:00:00Z',
        instanceKind: 'repeated_persisted',
        isSingle: false,
        isRepeatedPersistent: true,
        repetitionKind: 'weekly',
        repetitionMode: {
          id: 'mode-1',
          kind: 'weekly',
          weekly_starting_bitmask: 0b0000101,
        } as ScheduleItem['repetitionMode'],
        eventInstance: {
          id: 'inst-2',
          cancelled_at: '2026-04-20T10:00:00Z',
          event_id: 10,
          starts_at: '2026-04-21T10:00:00+03:00',
          ends_at: '2026-04-21T11:00:00+03:00',
          name: 'Алгебра',
          description: null,
          repetition_mode_id: 'mode-1',
          instance_index: 1,
          kind: 'repeated_persisted',
        },
      }),
    );

    expect(event.isCancelled).toBe(true);
    expect(event.scheduler?.weeklyBitmask).toBe(0b0000101);
    expect(event.scheduler?.repetitionModeId).toBe('mode-1');
  });
});

describe('getScheduleQueryRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 21, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('всегда включает сегодняшний день в диапазон', () => {
    // видимое окно — будущая неделя
    const days = [new Date(2026, 3, 27), new Date(2026, 3, 28), new Date(2026, 3, 29)];
    const range = getScheduleQueryRange(days);

    const expectedAfter = new Date(2026, 3, 21, 0, 0, 0, 0);
    const expectedBeforeEnd = new Date(2026, 3, 29, 23, 59, 59, 999);

    expect(range.happensAfter).toBe(toLocalISOString(expectedAfter));
    expect(range.happensBefore).toBe(toLocalISOString(new Date(expectedBeforeEnd.getTime() + 1)));
  });
});
