import { describe, expect, it } from 'vitest';
import type {
  EventInstanceDto,
  PersistedRepeatedEventInstanceDto,
  SoleEventInstanceDto,
  VirtualRepeatedEventInstanceDto,
} from 'common.api';
import { mapEventInstanceToScheduleItem, mapScheduleResponseToScheduleItems } from '../adapters';

const CLASSROOM_ID = 42;

const makeSoleInstance = (overrides: Partial<SoleEventInstanceDto> = {}): SoleEventInstanceDto => ({
  id: 'instance-uuid-sole',
  cancelled_at: null,
  event_id: 1,
  starts_at: '2026-04-21T10:00:00Z',
  ends_at: '2026-04-21T11:00:00Z',
  name: 'Инстанс: алгебра',
  description: 'Описание инстанса',
  kind: 'sole',
  ...overrides,
});

const makeVirtualRepeatedInstance = (
  overrides: Partial<VirtualRepeatedEventInstanceDto> = {},
): VirtualRepeatedEventInstanceDto => ({
  event_id: 1,
  starts_at: '2026-04-21T10:00:00Z',
  ends_at: '2026-04-21T11:00:00Z',
  name: 'Виртуальный повтор',
  description: null,
  repetition_mode_id: 'mode-uuid-weekly',
  instance_index: 2,
  kind: 'repeated_virtual',
  ...overrides,
});

const makePersistedRepeatedInstance = (
  overrides: Partial<PersistedRepeatedEventInstanceDto> = {},
): PersistedRepeatedEventInstanceDto => ({
  id: 'instance-uuid-repeated',
  cancelled_at: null,
  event_id: 1,
  starts_at: '2026-04-28T11:00:00Z',
  ends_at: '2026-04-28T12:00:00Z',
  name: 'Перенесённый повтор',
  description: 'Описание перенесённого повтора',
  repetition_mode_id: 'mode-uuid-weekly',
  instance_index: 3,
  kind: 'repeated_persisted',
  ...overrides,
});

describe('mapEventInstanceToScheduleItem', () => {
  it('создаёт ScheduleItem из sole', () => {
    const instance = makeSoleInstance();
    const item = mapEventInstanceToScheduleItem(instance, CLASSROOM_ID);

    expect(item.eventId).toBe(instance.event_id);
    expect(item.startsAt).toBe(instance.starts_at);
    expect(item.endsAt).toBe(instance.ends_at);
    expect(item.title).toBe(instance.name);
    expect(item.description).toBe(instance.description);
    expect(item.eventInstance).toBe(instance);
    expect(item.repetitionMode).toBeUndefined();
    expect(item.event).toBeUndefined();
    expect(item.classroomId).toBe(CLASSROOM_ID);
    expect(item.instanceKind).toBe('sole');
    expect(item.repetitionKind).toBeNull();
    expect(item.instanceIndex).toBeNull();
    expect(item.cancelledAt).toBeNull();
    expect(item.isSingle).toBe(true);
    expect(item.isRepeatedVirtual).toBe(false);
    expect(item.isRepeatedPersistent).toBe(false);
  });

  it('создаёт ScheduleItem из repeated_virtual без repetition_mode в ответе', () => {
    const instance = makeVirtualRepeatedInstance();
    const item = mapEventInstanceToScheduleItem(instance, CLASSROOM_ID);

    expect(item.repetitionMode).toBeUndefined();
    expect(item.repetitionKind).toBeNull();
    expect(item.instanceKind).toBe('repeated_virtual');
    expect(item.instanceIndex).toBe(instance.instance_index);
    expect(item.cancelledAt).toBeNull();
    expect(item.isRepeatedVirtual).toBe(true);
  });

  it('создаёт ScheduleItem из repeated_persisted', () => {
    const instance = makePersistedRepeatedInstance();
    const item = mapEventInstanceToScheduleItem(instance, CLASSROOM_ID);

    expect(item.instanceKind).toBe('repeated_persisted');
    expect(item.isRepeatedPersistent).toBe(true);
    expect(item.title).toBe(instance.name);
  });

  it('учитывает cancelled_at у persisted instance', () => {
    const instance = makePersistedRepeatedInstance({
      cancelled_at: '2026-04-28T09:00:00Z',
    });
    const item = mapEventInstanceToScheduleItem(instance, CLASSROOM_ID);

    expect(item.cancelledAt).toBe('2026-04-28T09:00:00Z');
  });

  it('учитывает cancelled_at у sole', () => {
    const instance = makeSoleInstance({ cancelled_at: '2026-04-21T08:00:00Z' });
    const item = mapEventInstanceToScheduleItem(instance, CLASSROOM_ID);

    expect(item.cancelledAt).toBe('2026-04-21T08:00:00Z');
  });

  it('classroomId может быть null', () => {
    const instance = makeSoleInstance();
    const item = mapEventInstanceToScheduleItem(instance, null);

    expect(item.classroomId).toBeNull();
  });
});

describe('mapScheduleResponseToScheduleItems', () => {
  it('возвращает пустой массив для пустого ответа', () => {
    const response: EventInstanceDto[] = [];

    expect(mapScheduleResponseToScheduleItems(response, CLASSROOM_ID)).toHaveLength(0);
  });

  it('маппит несколько инстансов разных видов и прокидывает classroomId', () => {
    const response: EventInstanceDto[] = [
      makeSoleInstance({
        starts_at: '2026-04-21T10:00:00Z',
        ends_at: '2026-04-21T11:00:00Z',
      }),
      makeVirtualRepeatedInstance({
        starts_at: '2026-04-22T10:00:00Z',
        ends_at: '2026-04-22T11:00:00Z',
      }),
      makePersistedRepeatedInstance({
        starts_at: '2026-04-28T10:00:00Z',
        ends_at: '2026-04-28T11:30:00Z',
      }),
    ];

    const items = mapScheduleResponseToScheduleItems(response, CLASSROOM_ID);

    expect(items).toHaveLength(3);
    expect(items.map((i) => i.instanceKind)).toEqual([
      'sole',
      'repeated_virtual',
      'repeated_persisted',
    ]);
    items.forEach((item) => {
      expect(item.classroomId).toBe(CLASSROOM_ID);
    });
  });

  it('не падает при инстансе без repetition_mode в теле ответа', () => {
    const response: EventInstanceDto[] = [
      makeVirtualRepeatedInstance({ event_id: 999, repetition_mode_id: 'broken-uuid' }),
    ];

    const items = mapScheduleResponseToScheduleItems(response, CLASSROOM_ID);

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('Виртуальный повтор');
    expect(items[0]?.repetitionMode).toBeUndefined();
    expect(items[0]?.event).toBeUndefined();
  });
});
