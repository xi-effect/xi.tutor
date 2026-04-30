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
  kind: 'repeated_persistent';
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

export type GetEventInstanceDetailsResponseDto = EventInstanceDto;
