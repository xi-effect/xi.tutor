/**
 * DTO-типы для Scheduler Service API.
 *
 * Соответствуют OpenAPI-контракту:
 *   /api/protected/scheduler-service/roles/tutor/classrooms/{classroom_id}/…
 */

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export interface SchedulerEventDto {
  id: number;
  name: string;
  description: string | null;
  classroom_id: number | null;
  kind: 'classroom';
}

// ---------------------------------------------------------------------------
// OccurrenceMode — input (для создания события)
// ---------------------------------------------------------------------------

export interface SingleOccurrenceModeInputDto {
  kind: 'single';
  starts_at: string;
  duration_seconds: number;
}

export interface DailyOccurrenceModeInputDto {
  kind: 'daily';
  starts_at: string;
  duration_seconds: number;
  /** Количество дней, в течение которых действует повторение */
  active_period_days: number;
}

export interface WeeklyOccurrenceModeInputDto {
  kind: 'weekly';
  starts_at: string;
  duration_seconds: number;
  active_period_days: number;
  /**
   * Битовая маска дней недели (0b0000001 — вс, 0b0000010 — пн, …).
   * Используется ТОЛЬКО в input. В response — weekly_starting_bitmask.
   */
  weekly_bitmask: number;
}

export type OccurrenceModeInputDto =
  | SingleOccurrenceModeInputDto
  | DailyOccurrenceModeInputDto
  | WeeklyOccurrenceModeInputDto;

// ---------------------------------------------------------------------------
// OccurrenceMode — response (из ответа сервера)
// ---------------------------------------------------------------------------

interface OccurrenceModeBaseDto {
  /** UUID */
  id: string;
  event_id: number;
  starts_at: string;
  duration_seconds: number;
}

export interface SingleOccurrenceModeDto extends OccurrenceModeBaseDto {
  kind: 'single';
}

export interface DailyOccurrenceModeDto extends OccurrenceModeBaseDto {
  kind: 'daily';
  active_period_days: number;
}

export interface WeeklyOccurrenceModeDto extends OccurrenceModeBaseDto {
  kind: 'weekly';
  active_period_days: number;
  /**
   * Битовая маска дней недели — поле ОТВЕТА.
   * Отличается от weekly_bitmask в input.
   */
  weekly_starting_bitmask: number;
}

/**
 * Возникает при переносах/исключениях.
 * Бизнес-логику не зашиваем — считаем отдельным kind.
 */
export interface ExceptionalOccurrenceModeDto extends OccurrenceModeBaseDto {
  kind: 'exceptional';
}

export type OccurrenceModeDto =
  | SingleOccurrenceModeDto
  | DailyOccurrenceModeDto
  | WeeklyOccurrenceModeDto
  | ExceptionalOccurrenceModeDto;

// ---------------------------------------------------------------------------
// EventInstance
// ---------------------------------------------------------------------------

export interface EventInstanceDto {
  starts_at: string;
  ends_at: string;
  /** UUID — ссылка на OccurrenceMode */
  occurrence_mode_id: string;
}

// ---------------------------------------------------------------------------
// Request / Response обёртки
// ---------------------------------------------------------------------------

export interface GetClassroomScheduleResponseDto {
  events: SchedulerEventDto[];
  occurrence_modes: OccurrenceModeDto[];
  event_instances: EventInstanceDto[];
}

export interface CreateClassroomEventRequestDto {
  event: {
    name: string;
    description?: string | null;
  };
  occurrence_mode: OccurrenceModeInputDto;
}

export interface UpdateClassroomEventRequestDto {
  name?: string;
  description?: string | null;
}
