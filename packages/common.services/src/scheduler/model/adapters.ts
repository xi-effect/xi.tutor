import type {
  EventInstanceDto,
  GetClassroomScheduleResponseDto,
  OccurrenceModeDto,
  SchedulerEventDto,
} from 'common.api';
import type { ScheduleItem } from './types';

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

export function buildEventsById(events: SchedulerEventDto[]): Map<number, SchedulerEventDto> {
  return new Map(events.map((e) => [e.id, e]));
}

export function buildOccurrenceModesById(
  modes: OccurrenceModeDto[],
): Map<string, OccurrenceModeDto> {
  return new Map(modes.map((m) => [m.id, m]));
}

// ---------------------------------------------------------------------------
// Single-instance mapper
// ---------------------------------------------------------------------------

/**
 * Собирает один ScheduleItem из EventInstance + заранее построенных Map-ов.
 *
 * Битые связи (отсутствие occurrence_mode или event) не бросают исключений:
 * соответствующее поле будет undefined, а title/description/classroomId
 * получат дефолтные значения. UI сам решает, как отобразить «битый» элемент.
 */
export function mapEventInstanceToScheduleItem(
  eventInstance: EventInstanceDto,
  occurrenceModesById: Map<string, OccurrenceModeDto>,
  eventsById: Map<number, SchedulerEventDto>,
): ScheduleItem {
  const occurrenceMode = occurrenceModesById.get(eventInstance.occurrence_mode_id);
  const event = occurrenceMode ? eventsById.get(occurrenceMode.event_id) : undefined;

  return {
    startsAt: eventInstance.starts_at,
    endsAt: eventInstance.ends_at,
    eventInstance,
    occurrenceMode,
    event,
    title: event?.name ?? '',
    description: event?.description ?? null,
    classroomId: event?.classroom_id ?? null,
    occurrenceKind: occurrenceMode?.kind ?? null,
  };
}

// ---------------------------------------------------------------------------
// Full-response mapper
// ---------------------------------------------------------------------------

/**
 * Маппит полный ответ GET /schedule/ в массив ScheduleItem.
 *
 * Lookup-логика (Map-построение) сосредоточена здесь, UI-компоненты
 * получают уже готовые плоские объекты.
 *
 * Поддерживает мульти-кабинетный сценарий: если в одном ответе придут
 * события нескольких кабинетов, они корректно попадут в плоский список.
 * Для фильтрации по кабинету используйте ScheduleItem.classroomId.
 */
export function mapScheduleResponseToScheduleItems(
  response: GetClassroomScheduleResponseDto,
): ScheduleItem[] {
  const eventsById = buildEventsById(response.events);
  const occurrenceModesById = buildOccurrenceModesById(response.occurrence_modes);

  return response.event_instances.map((instance) =>
    mapEventInstanceToScheduleItem(instance, occurrenceModesById, eventsById),
  );
}
