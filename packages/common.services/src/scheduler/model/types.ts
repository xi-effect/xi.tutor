import type { OccurrenceModeDto, SchedulerEventDto, EventInstanceDto } from 'common.api';

// ---------------------------------------------------------------------------
// Domain aliases — прямое переиспользование DTO как domain-типов.
// При необходимости их можно заменить на расширенные интерфейсы без изменения
// adapter-слоя.
// ---------------------------------------------------------------------------

export type SchedulerEvent = SchedulerEventDto;
export type OccurrenceMode = OccurrenceModeDto;
export type EventInstance = EventInstanceDto;

// ---------------------------------------------------------------------------
// ScheduleItem — плоский UI-friendly объект для отображения в календаре.
// Заполняется адаптером после склейки event_instance → occurrence_mode → event.
// ---------------------------------------------------------------------------

export interface ScheduleItem {
  /** ISO date-time начала вхождения */
  startsAt: string;
  /** ISO date-time конца вхождения */
  endsAt: string;
  /** Исходный EventInstance (сохраняем для возможных lookup-операций) */
  eventInstance: EventInstance;
  /**
   * OccurrenceMode, к которому относится это вхождение.
   * undefined — если связь сломана (occurrence_mode_id не найден).
   */
  occurrenceMode: OccurrenceMode | undefined;
  /**
   * Событие (Event) из которого вытекает этот OccurrenceMode.
   * undefined — если связь сломана (event_id не найден).
   */
  event: SchedulerEvent | undefined;
  /** Удобное поле: event.name ?? '' */
  title: string;
  /** Удобное поле: event.description ?? null */
  description: string | null;
  /** Удобное поле: event.classroom_id ?? null */
  classroomId: number | null;
  /** Удобное поле: occurrenceMode.kind ?? null */
  occurrenceKind: OccurrenceMode['kind'] | null;
}
