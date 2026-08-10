import { describe, expect, it } from 'vitest';
import type { ScheduleItem } from 'common.services';
import { mapScheduleItemToLessonRow } from '../mapScheduleItemToLessonRow';

const item = {
  eventId: 10,
  startsAt: '2026-04-21T10:30:00+03:00',
  endsAt: '2026-04-21T11:45:00+03:00',
  title: 'Алгебра',
  description: 'Тема',
  classroomId: 5,
  event: undefined,
  repetitionMode: {
    id: 'mode-1',
    kind: 'weekly',
    weekly_starting_bitmask: 3,
  },
  instanceKind: 'repeated_virtual',
  repetitionKind: 'weekly',
  instanceIndex: 2,
  cancelledAt: null,
  isSingle: false,
  isRepeatedVirtual: true,
  isRepeatedPersistent: false,
  eventInstance: {
    event_id: 10,
    starts_at: '2026-04-21T10:30:00+03:00',
    ends_at: '2026-04-21T11:45:00+03:00',
    name: 'Алгебра',
    description: 'Тема',
    repetition_mode_id: 'mode-1',
    instance_index: 2,
    kind: 'repeated_virtual',
  },
} as ScheduleItem;

describe('mapScheduleItemToLessonRow', () => {
  it('маппит ScheduleItem в строку дня', () => {
    const row = mapScheduleItemToLessonRow(item);

    expect(row.id).toBe(10);
    expect(row.classroomId).toBe(5);
    expect(row.subject).toBe('Алгебра');
    expect(row.description).toBe('Тема');
    expect(row.weeklyBitmask).toBe(3);
    expect(row.schedulerMeta).toMatchObject({
      eventId: 10,
      startsAt: '2026-04-21T10:30:00+03:00',
      instanceKind: 'repeated_virtual',
      repetitionModeId: 'mode-1',
      instanceIndex: 2,
      repetitionKind: 'weekly',
    });
    expect(row.schedulerMeta?.eventInstanceId).toBeUndefined();
  });
});
