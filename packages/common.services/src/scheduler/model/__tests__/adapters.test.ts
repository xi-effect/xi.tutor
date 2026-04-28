import { describe, expect, it } from 'vitest';
import type {
  DailyRepetitionModeDto,
  GetClassroomScheduleResponseDto,
  PersistedRepeatedEventInstanceDto,
  RepetitionModeDto,
  SchedulerEventDto,
  SoleEventInstanceDto,
  VirtualRepeatedEventInstanceDto,
  WeeklyRepetitionModeDto,
} from 'common.api';
import {
  buildEventsById,
  buildRepetitionModesById,
  mapEventInstanceToScheduleItem,
  mapScheduleResponseToScheduleItems,
} from '../adapters';

const makeEvent = (overrides: Partial<SchedulerEventDto> = {}): SchedulerEventDto => ({
  id: 1,
  name: 'Математика',
  description: 'Урок алгебры',
  classroom_id: 42,
  kind: 'classroom',
  ...overrides,
});

const makeDailyMode = (
  overrides: Partial<DailyRepetitionModeDto> = {},
): DailyRepetitionModeDto => ({
  id: 'mode-uuid-daily',
  event_id: 1,
  starts_at: '2026-04-21T10:00:00Z',
  duration_seconds: 3600,
  active_period_days: 30,
  kind: 'daily',
  ...overrides,
});

const makeWeeklyMode = (
  overrides: Partial<WeeklyRepetitionModeDto> = {},
): WeeklyRepetitionModeDto => ({
  id: 'mode-uuid-weekly',
  event_id: 1,
  starts_at: '2026-04-21T10:00:00Z',
  duration_seconds: 5400,
  active_period_days: 90,
  weekly_starting_bitmask: 0b0000010,
  kind: 'weekly',
  ...overrides,
});

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
  kind: 'repeated_persistent',
  ...overrides,
});

describe('buildEventsById', () => {
  it('строит Map по id события', () => {
    const event = makeEvent({ id: 7 });
    const map = buildEventsById([event]);

    expect(map.get(7)).toBe(event);
    expect(map.size).toBe(1);
  });

  it('возвращает пустой Map для пустого массива', () => {
    expect(buildEventsById([]).size).toBe(0);
  });
});

describe('buildRepetitionModesById', () => {
  it('строит Map по uuid режима', () => {
    const mode = makeWeeklyMode({ id: 'abc-123' });
    const map = buildRepetitionModesById([mode]);

    expect(map.get('abc-123')).toBe(mode);
  });

  it('возвращает пустой Map для пустого массива', () => {
    expect(buildRepetitionModesById([]).size).toBe(0);
  });
});

describe('mapEventInstanceToScheduleItem', () => {
  it('создаёт ScheduleItem из sole без repetitionMode', () => {
    const event = makeEvent();
    const instance = makeSoleInstance();
    const item = mapEventInstanceToScheduleItem(
      instance,
      buildEventsById([event]),
      buildRepetitionModesById([]),
    );

    expect(item.eventId).toBe(instance.event_id);
    expect(item.startsAt).toBe(instance.starts_at);
    expect(item.endsAt).toBe(instance.ends_at);
    expect(item.title).toBe(instance.name);
    expect(item.description).toBe(instance.description);
    expect(item.eventInstance).toBe(instance);
    expect(item.repetitionMode).toBeUndefined();
    expect(item.event).toBe(event);
    expect(item.classroomId).toBe(event.classroom_id);
    expect(item.instanceKind).toBe('sole');
    expect(item.repetitionKind).toBeNull();
    expect(item.instanceIndex).toBeNull();
    expect(item.cancelledAt).toBeNull();
    expect(item.isSingle).toBe(true);
    expect(item.isRepeatedVirtual).toBe(false);
    expect(item.isRepeatedPersistent).toBe(false);
  });

  it('создаёт ScheduleItem из repeated_virtual и склеивает repetition_mode', () => {
    const event = makeEvent();
    const mode = makeWeeklyMode();
    const instance = makeVirtualRepeatedInstance({ repetition_mode_id: mode.id });
    const item = mapEventInstanceToScheduleItem(
      instance,
      buildEventsById([event]),
      buildRepetitionModesById([mode]),
    );

    expect(item.repetitionMode).toBe(mode);
    expect(item.repetitionKind).toBe('weekly');
    expect(item.instanceKind).toBe('repeated_virtual');
    expect(item.instanceIndex).toBe(instance.instance_index);
    expect(item.cancelledAt).toBeNull();
    expect(item.isRepeatedVirtual).toBe(true);
  });

  it('создаёт ScheduleItem из repeated_persistent', () => {
    const event = makeEvent();
    const mode = makeWeeklyMode();
    const instance = makePersistedRepeatedInstance({ repetition_mode_id: mode.id });
    const item = mapEventInstanceToScheduleItem(
      instance,
      buildEventsById([event]),
      buildRepetitionModesById([mode]),
    );

    expect(item.repetitionMode).toBe(mode);
    expect(item.instanceKind).toBe('repeated_persistent');
    expect(item.isRepeatedPersistent).toBe(true);
    expect(item.title).toBe(instance.name);
  });

  it('учитывает cancelled_at у persisted instance', () => {
    const event = makeEvent();
    const mode = makeWeeklyMode();
    const instance = makePersistedRepeatedInstance({
      repetition_mode_id: mode.id,
      cancelled_at: '2026-04-28T09:00:00Z',
    });
    const item = mapEventInstanceToScheduleItem(
      instance,
      buildEventsById([event]),
      buildRepetitionModesById([mode]),
    );

    expect(item.cancelledAt).toBe('2026-04-28T09:00:00Z');
  });

  it('корректно склеивает event_instance -> event', () => {
    const event = makeEvent({ id: 77, classroom_id: 501 });
    const instance = makeSoleInstance({ event_id: event.id });
    const item = mapEventInstanceToScheduleItem(
      instance,
      buildEventsById([event]),
      buildRepetitionModesById([]),
    );

    expect(item.event).toBe(event);
    expect(item.classroomId).toBe(501);
  });

  it('корректно склеивает event_instance -> repetition_mode', () => {
    const mode = makeDailyMode({ id: 'daily-id' });
    const instance = makeVirtualRepeatedInstance({ repetition_mode_id: mode.id });
    const item = mapEventInstanceToScheduleItem(
      instance,
      buildEventsById([makeEvent()]),
      buildRepetitionModesById([mode]),
    );

    expect(item.repetitionMode).toBe(mode);
    expect(item.repetitionKind).toBe('daily');
  });

  it('не падает при отсутствии event', () => {
    const instance = makeSoleInstance({ event_id: 999 });
    const item = mapEventInstanceToScheduleItem(instance, new Map(), new Map());

    expect(item.event).toBeUndefined();
    expect(item.title).toBe(instance.name);
    expect(item.classroomId).toBeNull();
  });

  it('не падает при отсутствии repetition_mode для repeated instance', () => {
    const event = makeEvent();
    const instance = makeVirtualRepeatedInstance({ repetition_mode_id: 'missing-mode' });
    const item = mapEventInstanceToScheduleItem(instance, buildEventsById([event]), new Map());

    expect(item.event).toBe(event);
    expect(item.repetitionMode).toBeUndefined();
    expect(item.repetitionKind).toBeNull();
    expect(item.instanceIndex).toBe(instance.instance_index);
  });
});

describe('mapScheduleResponseToScheduleItems', () => {
  it('возвращает пустой массив для пустого ответа', () => {
    const response: GetClassroomScheduleResponseDto = {
      events: [],
      repetition_modes: [],
      event_instances: [],
    };

    expect(mapScheduleResponseToScheduleItems(response)).toHaveLength(0);
  });

  it('маппит несколько инстансов разных видов', () => {
    const event = makeEvent({ id: 1 });
    const weekly = makeWeeklyMode({ id: 'weekly-id', event_id: 1 });
    const response: GetClassroomScheduleResponseDto = {
      events: [event],
      repetition_modes: [weekly] as RepetitionModeDto[],
      event_instances: [
        makeSoleInstance({
          starts_at: '2026-04-21T10:00:00Z',
          ends_at: '2026-04-21T11:00:00Z',
        }),
        makeVirtualRepeatedInstance({
          repetition_mode_id: weekly.id,
          starts_at: '2026-04-22T10:00:00Z',
          ends_at: '2026-04-22T11:00:00Z',
        }),
        makePersistedRepeatedInstance({
          repetition_mode_id: weekly.id,
          starts_at: '2026-04-28T10:00:00Z',
          ends_at: '2026-04-28T11:30:00Z',
        }),
      ],
    };

    const items = mapScheduleResponseToScheduleItems(response);

    expect(items).toHaveLength(3);
    expect(items.map((i) => i.instanceKind)).toEqual([
      'sole',
      'repeated_virtual',
      'repeated_persistent',
    ]);
    items.forEach((item) => {
      expect(item.event).toBe(event);
      expect(item.classroomId).toBe(event.classroom_id);
    });
  });

  it('не падает при битых связях в ответе', () => {
    const response: GetClassroomScheduleResponseDto = {
      events: [],
      repetition_modes: [],
      event_instances: [
        makeVirtualRepeatedInstance({ event_id: 999, repetition_mode_id: 'broken-uuid' }),
      ],
    };

    const items = mapScheduleResponseToScheduleItems(response);

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('Виртуальный повтор');
    expect(items[0]?.repetitionMode).toBeUndefined();
    expect(items[0]?.event).toBeUndefined();
  });

  it('задел под мульти-кабинетный сценарий: classroomId берётся из event, не из контекста', () => {
    const eventA = makeEvent({ id: 1, classroom_id: 10 });
    const eventB = makeEvent({ id: 2, classroom_id: 20 });
    const response: GetClassroomScheduleResponseDto = {
      events: [eventA, eventB],
      repetition_modes: [],
      event_instances: [
        makeSoleInstance({ id: 'instance-a', event_id: eventA.id }),
        makeSoleInstance({ id: 'instance-b', event_id: eventB.id }),
      ],
    };

    const items = mapScheduleResponseToScheduleItems(response);

    expect(items[0]?.classroomId).toBe(10);
    expect(items[1]?.classroomId).toBe(20);
  });
});
