export interface SchedulerEventDto {
  id: number;
  name: string;
  description: string | null;
  classroom_id: number | null;
  kind: 'classroom';
}

export interface EventInputDto {
  name: string;
  description: string | null;
}

export interface SoleEventInstanceInputDto {
  starts_at: string;
  duration_seconds: number;
}

export interface DailyRepetitionModeInputDto {
  kind: 'daily';
  starts_at: string;
  duration_seconds: number;
  active_period_days: number;
}

export interface WeeklyRepetitionModeInputDto {
  kind: 'weekly';
  starts_at: string;
  duration_seconds: number;
  active_period_days: number;
  weekly_bitmask: number;
}

export type RepetitionModeInputDto = DailyRepetitionModeInputDto | WeeklyRepetitionModeInputDto;

export interface SingleEventInputDto {
  event: EventInputDto;
  kind: 'single';
  sole_instance: SoleEventInstanceInputDto;
}

export interface RepeatingEventInputDto {
  event: EventInputDto;
  kind: 'repeating';
  repetition_mode: RepetitionModeInputDto;
}

export type CreateClassroomEventRequestDto = SingleEventInputDto | RepeatingEventInputDto;

export interface UpdateClassroomEventRequestDto {
  name?: string;
  description?: string | null;
}

interface RepetitionModeBaseDto {
  id: string;
  event_id: number;
  starts_at: string;
  duration_seconds: number;
  active_period_days: number | null;
}

export interface DailyRepetitionModeDto extends RepetitionModeBaseDto {
  kind: 'daily';
}

export interface WeeklyRepetitionModeDto extends RepetitionModeBaseDto {
  kind: 'weekly';
  weekly_starting_bitmask: number | null;
}

export type RepetitionModeDto = DailyRepetitionModeDto | WeeklyRepetitionModeDto;

interface EventInstanceBaseDto {
  event_id: number;
  starts_at: string;
  ends_at: string;
  name: string;
  description: string | null;
}

export interface SoleEventInstanceDto extends EventInstanceBaseDto {
  id: string;
  cancelled_at: string | null;
  kind: 'sole';
}

export interface PersistedRepeatedEventInstanceDto extends EventInstanceBaseDto {
  id: string;
  cancelled_at: string | null;
  repetition_mode_id: string;
  instance_index: number;
  kind: 'repeated_persistent';
}

export interface VirtualRepeatedEventInstanceDto extends EventInstanceBaseDto {
  repetition_mode_id: string;
  instance_index: number;
  kind: 'repeated_virtual';
}

export type EventInstanceDto =
  | SoleEventInstanceDto
  | PersistedRepeatedEventInstanceDto
  | VirtualRepeatedEventInstanceDto;

export interface GetClassroomScheduleResponseDto {
  events: SchedulerEventDto[];
  repetition_modes: RepetitionModeDto[];
  event_instances: EventInstanceDto[];
}
