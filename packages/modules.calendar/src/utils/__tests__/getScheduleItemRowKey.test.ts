import { describe, expect, it } from 'vitest';
import type { ScheduleItem } from 'common.services';
import { getScheduleItemRowKey } from '../getScheduleItemRowKey';

const baseItem = {
  eventId: 10,
  startsAt: '2026-04-21T10:00:00Z',
  endsAt: '2026-04-21T11:00:00Z',
  title: 'Алгебра',
  description: null,
  classroomId: 1,
  event: undefined,
  repetitionMode: undefined,
  repetitionKind: null,
  cancelledAt: null,
  isSingle: false,
  isRepeatedVirtual: false,
  isRepeatedPersistent: false,
} as const;

describe('getScheduleItemRowKey', () => {
  it('использует id для persisted-инстанса', () => {
    const item = {
      ...baseItem,
      instanceKind: 'sole',
      instanceIndex: null,
      isSingle: true,
      eventInstance: {
        id: 'instance-uuid',
        cancelled_at: null,
        event_id: 10,
        starts_at: baseItem.startsAt,
        ends_at: baseItem.endsAt,
        name: 'Алгебра',
        description: null,
        kind: 'sole',
      },
    } as ScheduleItem;

    expect(getScheduleItemRowKey(item)).toBe('instance-uuid');
  });

  it('собирает составной ключ для virtual', () => {
    const item = {
      ...baseItem,
      instanceKind: 'repeated_virtual',
      instanceIndex: 2,
      isRepeatedVirtual: true,
      eventInstance: {
        event_id: 10,
        starts_at: baseItem.startsAt,
        ends_at: baseItem.endsAt,
        name: 'Алгебра',
        description: null,
        repetition_mode_id: 'mode-1',
        instance_index: 2,
        kind: 'repeated_virtual',
      },
    } as ScheduleItem;

    expect(getScheduleItemRowKey(item)).toBe(
      '10:repeated_virtual:2:2026-04-21T10:00:00Z',
    );
  });
});
