export type SchedulerEventDto = {
  id: number;
  name: string;
  description: string | null;
  classroom_id: number | null;
  kind: 'classroom';
};

export type EventInputDto = {
  name: string;
  description: string | null;
};

export type SoleEventInstanceInputDto = {
  starts_at: string;
  duration_seconds: number;
};

export type DailyRepetitionModeInputDto = {
  kind: 'daily';
  starts_at: string;
  duration_seconds: number;
  /** Если не задано — поведение определяет бэкенд */
  active_period_days?: number;
};

export type WeeklyRepetitionModeInputDto = {
  kind: 'weekly';
  starts_at: string;
  duration_seconds: number;
  /** Если не задано — поведение определяет бэкенд */
  active_period_days?: number;
  weekly_bitmask: number;
};

export type RepetitionModeInputDto = DailyRepetitionModeInputDto | WeeklyRepetitionModeInputDto;

export type SingleEventInputDto = {
  event: EventInputDto;
  kind: 'single';
  sole_instance: SoleEventInstanceInputDto;
};

export type RepeatingEventInputDto = {
  event: EventInputDto;
  kind: 'repeating';
  repetition_mode: RepetitionModeInputDto;
};

export type CreateClassroomEventRequestDto = SingleEventInputDto | RepeatingEventInputDto;

export type UpdateClassroomEventRequestDto = {
  name?: string;
  description?: string | null;
};

/**
 * Тело ручки `POST .../events/{event_id}/cancellations/`.
 * TODO: уточнить точное имя поля по итоговой OpenAPI-схеме
 * `Body_cancel_repeating_event_after_timestamp_..._cancellations__post`.
 */
export type CancelRepeatingEventAfterTimestampInputDto = {
  /** ISO date-time, после которого повторения серии должны быть отменены. */
  cancel_after: string;
};

type RepetitionModeBaseDto = {
  id: string;
  event_id: number;
  starts_at: string;
  duration_seconds: number;
  active_period_days: number | null;
};

export type DailyRepetitionModeDto = RepetitionModeBaseDto & {
  kind: 'daily';
};

export type WeeklyRepetitionModeDto = RepetitionModeBaseDto & {
  kind: 'weekly';
  weekly_starting_bitmask: number | null;
};

export type RepetitionModeDto = DailyRepetitionModeDto | WeeklyRepetitionModeDto;

type EventInstanceBaseDto = {
  event_id: number;
  starts_at: string;
  ends_at: string;
  name: string;
  description: string | null;
  /**
   * Присутствует в ответах глобального расписания (`roles/{role}/schedule/`).
   * В расписании конкретного кабинета отсутствует — classroomId берётся из параметра URL.
   */
  classroom_id?: number | null;
  /** Присутствует в детальных ручках и, возможно, в глобальном расписании */
  event?: SchedulerEventDto;
};

export type SoleEventInstanceDto = EventInstanceBaseDto & {
  id: string;
  cancelled_at: string | null;
  kind: 'sole';
};

export type PersistedRepeatedEventInstanceDto = EventInstanceBaseDto & {
  id: string;
  cancelled_at: string | null;
  repetition_mode_id: string;
  instance_index: number;
  kind: 'repeated_persisted';
};

export type VirtualRepeatedEventInstanceDto = EventInstanceBaseDto & {
  repetition_mode_id: string;
  instance_index: number;
  kind: 'repeated_virtual';
};

export type EventInstanceDto =
  | SoleEventInstanceDto
  | PersistedRepeatedEventInstanceDto
  | VirtualRepeatedEventInstanceDto;

export type EventInstanceTimeSlotInputDto = {
  starts_at: string;
  duration_seconds: number;
};

// ---------------------------------------------------------------------------
// Detailed event-instance schemas (legacy — используются в глобальном расписании)
// ---------------------------------------------------------------------------

export type SoleEventInstanceDetailedDto = SoleEventInstanceDto & {
  event?: SchedulerEventDto;
};

export type PersistedRepeatedEventInstanceDetailedDto = PersistedRepeatedEventInstanceDto & {
  event?: SchedulerEventDto;
  repetition_mode?: RepetitionModeDto;
};

export type VirtualRepeatedEventInstanceDetailedDto = VirtualRepeatedEventInstanceDto & {
  event?: SchedulerEventDto;
  repetition_mode?: RepetitionModeDto;
};

export type DetailedEventInstanceDto =
  | SoleEventInstanceDetailedDto
  | PersistedRepeatedEventInstanceDetailedDto
  | VirtualRepeatedEventInstanceDetailedDto;

// ---------------------------------------------------------------------------
// GET event-instances/{id}/ — реальная структура ответа
// Данные времени вложены в persisted_event_instance, имя занятия — в event.name
// ---------------------------------------------------------------------------

/** Слот времени конкретного экземпляра занятия (sole или persisted_repeated) */
export type EventInstancePersistedSlotDto = {
  id: string;
  cancelled_at: string | null;
  starts_at: string;
  ends_at: string;
};

export type SoleEventInstanceDetailsResponseDto = {
  kind: 'sole';
  event: SchedulerEventDto;
  persisted_event_instance: EventInstancePersistedSlotDto;
};

export type PersistedRepeatedEventInstanceDetailsResponseDto = {
  kind: 'repeated_persisted';
  event: SchedulerEventDto;
  persisted_event_instance: EventInstancePersistedSlotDto;
  repetition_mode?: RepetitionModeDto;
};

/** Для виртуальных повторов время может быть на верхнем уровне или в другой вложенной структуре.
 *  Точная схема уточняется по OpenAPI; пока используем гибкий вариант. */
export type VirtualRepeatedEventInstanceDetailsResponseDto = {
  kind: 'repeated_virtual';
  event: SchedulerEventDto;
  starts_at: string;
  ends_at: string;
  instance_index: number;
  repetition_mode_id: string;
  repetition_mode?: RepetitionModeDto;
};

export type GetEventInstanceDetailsResponseDto =
  | SoleEventInstanceDetailsResponseDto
  | PersistedRepeatedEventInstanceDetailsResponseDto
  | VirtualRepeatedEventInstanceDetailsResponseDto;

// ---------------------------------------------------------------------------
// Create classroom event response (теперь union по `kind`)
// ---------------------------------------------------------------------------

export type CreateSingleEventResponseDto = {
  kind: 'single';
  event: SchedulerEventDto;
  sole_instance: SoleEventInstanceDto;
};

export type CreateRepeatingEventResponseDto = {
  kind: 'repeating';
  event: SchedulerEventDto;
  repetition_mode: RepetitionModeDto;
};

export type CreateClassroomEventResponseDto =
  | CreateSingleEventResponseDto
  | CreateRepeatingEventResponseDto;

/** Ответ POST …/events/{event_id}/last-repetition-mode/ */
export type CreateLastRepetitionModeResponseDto = RepetitionModeDto;
