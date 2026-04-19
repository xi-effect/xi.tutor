import { describe, it, expect } from 'vitest';
import type {
  EventInstanceDto,
  GetClassroomScheduleResponseDto,
  OccurrenceModeDto,
  SchedulerEventDto,
  SingleOccurrenceModeDto,
  DailyOccurrenceModeDto,
  WeeklyOccurrenceModeDto,
  ExceptionalOccurrenceModeDto,
} from 'common.api';
import {
  buildEventsById,
  buildOccurrenceModesById,
  mapEventInstanceToScheduleItem,
  mapScheduleResponseToScheduleItems,
} from '../adapters';

// ---------------------------------------------------------------------------
// Фикстуры
// ---------------------------------------------------------------------------

const makeEvent = (overrides: Partial<SchedulerEventDto> = {}): SchedulerEventDto => ({
  id: 1,
  name: 'Математика',
  description: 'Урок алгебры',
  classroom_id: 42,
  kind: 'classroom',
  ...overrides,
});

const makeSingleMode = (
  overrides: Partial<SingleOccurrenceModeDto> = {},
): SingleOccurrenceModeDto => ({
  id: 'mode-uuid-single',
  event_id: 1,
  starts_at: '2026-04-21T10:00:00Z',
  duration_seconds: 3600,
  kind: 'single',
  ...overrides,
});

const makeDailyMode = (
  overrides: Partial<DailyOccurrenceModeDto> = {},
): DailyOccurrenceModeDto => ({
  id: 'mode-uuid-daily',
  event_id: 1,
  starts_at: '2026-04-21T10:00:00Z',
  duration_seconds: 3600,
  kind: 'daily',
  active_period_days: 30,
  ...overrides,
});

const makeWeeklyMode = (
  overrides: Partial<WeeklyOccurrenceModeDto> = {},
): WeeklyOccurrenceModeDto => ({
  id: 'mode-uuid-weekly',
  event_id: 1,
  starts_at: '2026-04-21T10:00:00Z',
  duration_seconds: 5400,
  kind: 'weekly',
  active_period_days: 90,
  weekly_starting_bitmask: 0b0000010, // понедельник
  ...overrides,
});

const makeExceptionalMode = (
  overrides: Partial<ExceptionalOccurrenceModeDto> = {},
): ExceptionalOccurrenceModeDto => ({
  id: 'mode-uuid-exceptional',
  event_id: 1,
  starts_at: '2026-04-28T10:00:00Z',
  duration_seconds: 3600,
  kind: 'exceptional',
  ...overrides,
});

const makeInstance = (
  occurrenceModeId: string,
  overrides: Partial<EventInstanceDto> = {},
): EventInstanceDto => ({
  starts_at: '2026-04-21T10:00:00Z',
  ends_at: '2026-04-21T11:00:00Z',
  occurrence_mode_id: occurrenceModeId,
  ...overrides,
});

// ---------------------------------------------------------------------------
// buildEventsById
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// buildOccurrenceModesById
// ---------------------------------------------------------------------------

describe('buildOccurrenceModesById', () => {
  it('строит Map по uuid режима', () => {
    const mode = makeSingleMode({ id: 'abc-123' });
    const map = buildOccurrenceModesById([mode]);
    expect(map.get('abc-123')).toBe(mode);
  });

  it('возвращает пустой Map для пустого массива', () => {
    expect(buildOccurrenceModesById([]).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// mapEventInstanceToScheduleItem — полная цепочка
// ---------------------------------------------------------------------------

describe('mapEventInstanceToScheduleItem', () => {
  it('single: корректно склеивает instance → mode → event', () => {
    const event = makeEvent();
    const mode = makeSingleMode();
    const instance = makeInstance(mode.id);

    const eventsMap = buildEventsById([event]);
    const modesMap = buildOccurrenceModesById([mode]);

    const item = mapEventInstanceToScheduleItem(instance, modesMap, eventsMap);

    expect(item.startsAt).toBe(instance.starts_at);
    expect(item.endsAt).toBe(instance.ends_at);
    expect(item.eventInstance).toBe(instance);
    expect(item.occurrenceMode).toBe(mode);
    expect(item.event).toBe(event);
    expect(item.title).toBe(event.name);
    expect(item.description).toBe(event.description);
    expect(item.classroomId).toBe(event.classroom_id);
    expect(item.occurrenceKind).toBe('single');
  });

  it('daily: occurrenceKind = "daily", поля active_period_days доступны через occurrenceMode', () => {
    const event = makeEvent();
    const mode = makeDailyMode();
    const instance = makeInstance(mode.id);

    const item = mapEventInstanceToScheduleItem(
      instance,
      buildOccurrenceModesById([mode]),
      buildEventsById([event]),
    );

    expect(item.occurrenceKind).toBe('daily');
    expect(item.occurrenceMode?.kind).toBe('daily');
  });

  it('weekly: occurrenceKind = "weekly", weekly_starting_bitmask доступен через occurrenceMode', () => {
    const event = makeEvent();
    const mode = makeWeeklyMode();
    const instance = makeInstance(mode.id);

    const item = mapEventInstanceToScheduleItem(
      instance,
      buildOccurrenceModesById([mode]),
      buildEventsById([event]),
    );

    expect(item.occurrenceKind).toBe('weekly');
    if (item.occurrenceMode?.kind === 'weekly') {
      expect(item.occurrenceMode.weekly_starting_bitmask).toBe(0b0000010);
    }
  });

  it('exceptional: occurrenceKind = "exceptional"', () => {
    const event = makeEvent();
    const mode = makeExceptionalMode();
    const instance = makeInstance(mode.id);

    const item = mapEventInstanceToScheduleItem(
      instance,
      buildOccurrenceModesById([mode]),
      buildEventsById([event]),
    );

    expect(item.occurrenceKind).toBe('exceptional');
  });

  it('битая связь: occurrence_mode_id не найден → occurrenceMode=undefined, event=undefined, title=""', () => {
    const instance = makeInstance('non-existent-uuid');
    const item = mapEventInstanceToScheduleItem(instance, new Map(), new Map());

    expect(item.occurrenceMode).toBeUndefined();
    expect(item.event).toBeUndefined();
    expect(item.title).toBe('');
    expect(item.description).toBeNull();
    expect(item.classroomId).toBeNull();
    expect(item.occurrenceKind).toBeNull();
  });

  it('битая связь: event_id не найден в eventsById → event=undefined, title=""', () => {
    const mode = makeSingleMode({ event_id: 999 });
    const instance = makeInstance(mode.id);

    const item = mapEventInstanceToScheduleItem(
      instance,
      buildOccurrenceModesById([mode]),
      new Map(), // eventsById пуст
    );

    expect(item.occurrenceMode).toBe(mode);
    expect(item.event).toBeUndefined();
    expect(item.title).toBe('');
    expect(item.classroomId).toBeNull();
  });

  it('event.description = null передаётся корректно', () => {
    const event = makeEvent({ description: null });
    const mode = makeSingleMode();
    const instance = makeInstance(mode.id);

    const item = mapEventInstanceToScheduleItem(
      instance,
      buildOccurrenceModesById([mode]),
      buildEventsById([event]),
    );

    expect(item.description).toBeNull();
  });

  it('event.classroom_id = null передаётся корректно', () => {
    const event = makeEvent({ classroom_id: null });
    const mode = makeSingleMode();
    const instance = makeInstance(mode.id);

    const item = mapEventInstanceToScheduleItem(
      instance,
      buildOccurrenceModesById([mode]),
      buildEventsById([event]),
    );

    expect(item.classroomId).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// mapScheduleResponseToScheduleItems
// ---------------------------------------------------------------------------

describe('mapScheduleResponseToScheduleItems', () => {
  it('возвращает пустой массив для пустого ответа', () => {
    const response: GetClassroomScheduleResponseDto = {
      events: [],
      occurrence_modes: [],
      event_instances: [],
    };
    expect(mapScheduleResponseToScheduleItems(response)).toHaveLength(0);
  });

  it('маппит несколько инстансов разных видов', () => {
    const event = makeEvent({ id: 1 });
    const single = makeSingleMode({ id: 'single-id', event_id: 1 });
    const daily = makeDailyMode({ id: 'daily-id', event_id: 1 });
    const weekly = makeWeeklyMode({ id: 'weekly-id', event_id: 1 });
    const exceptional = makeExceptionalMode({ id: 'exceptional-id', event_id: 1 });

    const response: GetClassroomScheduleResponseDto = {
      events: [event],
      occurrence_modes: [single, daily, weekly, exceptional] as OccurrenceModeDto[],
      event_instances: [
        makeInstance('single-id', {
          starts_at: '2026-04-21T10:00:00Z',
          ends_at: '2026-04-21T11:00:00Z',
        }),
        makeInstance('daily-id', {
          starts_at: '2026-04-22T10:00:00Z',
          ends_at: '2026-04-22T11:00:00Z',
        }),
        makeInstance('weekly-id', {
          starts_at: '2026-04-28T10:00:00Z',
          ends_at: '2026-04-28T11:30:00Z',
        }),
        makeInstance('exceptional-id', {
          starts_at: '2026-04-29T10:00:00Z',
          ends_at: '2026-04-29T11:00:00Z',
        }),
      ],
    };

    const items = mapScheduleResponseToScheduleItems(response);
    expect(items).toHaveLength(4);
    expect(items.map((i) => i.occurrenceKind)).toEqual([
      'single',
      'daily',
      'weekly',
      'exceptional',
    ]);
    items.forEach((item) => {
      expect(item.title).toBe(event.name);
      expect(item.classroomId).toBe(event.classroom_id);
    });
  });

  it('не падает при битых связях в ответе — возвращает дефолтные поля', () => {
    const response: GetClassroomScheduleResponseDto = {
      events: [],
      occurrence_modes: [],
      event_instances: [makeInstance('broken-uuid')],
    };

    const items = mapScheduleResponseToScheduleItems(response);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('');
    expect(items[0]?.occurrenceMode).toBeUndefined();
    expect(items[0]?.event).toBeUndefined();
  });

  it('задел под мульти-кабинетный сценарий: classroomId берётся из event, не из контекста', () => {
    const eventA = makeEvent({ id: 1, classroom_id: 10 });
    const eventB = makeEvent({ id: 2, classroom_id: 20 });
    const modeA = makeSingleMode({ id: 'mode-a', event_id: 1 });
    const modeB = makeSingleMode({ id: 'mode-b', event_id: 2 });

    const response: GetClassroomScheduleResponseDto = {
      events: [eventA, eventB],
      occurrence_modes: [modeA, modeB],
      event_instances: [makeInstance('mode-a'), makeInstance('mode-b')],
    };

    const items = mapScheduleResponseToScheduleItems(response);
    expect(items[0]?.classroomId).toBe(10);
    expect(items[1]?.classroomId).toBe(20);
  });
});
