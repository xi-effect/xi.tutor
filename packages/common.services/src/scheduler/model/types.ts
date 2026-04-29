import type {
  EventInstanceDto,
  PersistedRepeatedEventInstanceDto,
  RepetitionModeDto,
  SchedulerEventDto,
  SoleEventInstanceDto,
  VirtualRepeatedEventInstanceDto,
} from 'common.api';

export type SchedulerEvent = SchedulerEventDto;
export type RepetitionMode = RepetitionModeDto;
export type EventInstance = EventInstanceDto;
export type SoleEventInstance = SoleEventInstanceDto;
export type PersistedRepeatedEventInstance = PersistedRepeatedEventInstanceDto;
export type VirtualRepeatedEventInstance = VirtualRepeatedEventInstanceDto;

export interface SingleEvent extends SchedulerEvent {
  scheduleKind: 'single';
  soleInstance: SoleEventInstance;
}

export interface RepeatingEvent extends SchedulerEvent {
  scheduleKind: 'repeating';
  repetitionMode: RepetitionMode;
}

export interface ScheduleItem {
  eventId: number;
  startsAt: string;
  endsAt: string;
  title: string;
  description: string | null;
  classroomId: number | null;
  eventInstance: EventInstance;
  event: SchedulerEvent | undefined;
  repetitionMode: RepetitionMode | undefined;
  instanceKind: EventInstance['kind'];
  repetitionKind: RepetitionMode['kind'] | null;
  instanceIndex: number | null;
  cancelledAt: string | null;
  isSingle: boolean;
  isRepeatedVirtual: boolean;
  isRepeatedPersistent: boolean;
}
