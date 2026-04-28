import type {
  EventInstanceDto,
  GetClassroomScheduleResponseDto,
  RepetitionModeDto,
  SchedulerEventDto,
} from 'common.api';
import type { ScheduleItem } from './types';

export function buildEventsById(events: SchedulerEventDto[]): Map<number, SchedulerEventDto> {
  return new Map(events.map((e) => [e.id, e]));
}

export function buildRepetitionModesById(
  modes: RepetitionModeDto[],
): Map<string, RepetitionModeDto> {
  return new Map(modes.map((m) => [m.id, m]));
}

export function mapEventInstanceToScheduleItem(
  eventInstance: EventInstanceDto,
  eventsById: Map<number, SchedulerEventDto>,
  repetitionModesById: Map<string, RepetitionModeDto>,
): ScheduleItem {
  const event = eventsById.get(eventInstance.event_id);
  const repetitionMode =
    'repetition_mode_id' in eventInstance
      ? repetitionModesById.get(eventInstance.repetition_mode_id)
      : undefined;
  const cancelledAt = 'cancelled_at' in eventInstance ? eventInstance.cancelled_at : null;
  const instanceIndex = 'instance_index' in eventInstance ? eventInstance.instance_index : null;

  return {
    eventId: eventInstance.event_id,
    startsAt: eventInstance.starts_at,
    endsAt: eventInstance.ends_at,
    title: eventInstance.name,
    description: eventInstance.description ?? null,
    classroomId: event?.classroom_id ?? null,
    eventInstance,
    event,
    repetitionMode,
    instanceKind: eventInstance.kind,
    repetitionKind: repetitionMode?.kind ?? null,
    instanceIndex,
    cancelledAt,
    isSingle: eventInstance.kind === 'sole',
    isRepeatedVirtual: eventInstance.kind === 'repeated_virtual',
    isRepeatedPersistent: eventInstance.kind === 'repeated_persistent',
  };
}

export function mapScheduleResponseToScheduleItems(
  response: GetClassroomScheduleResponseDto,
): ScheduleItem[] {
  const eventsById = buildEventsById(response.events);
  const repetitionModesById = buildRepetitionModesById(response.repetition_modes);

  return response.event_instances.map((instance) =>
    mapEventInstanceToScheduleItem(instance, eventsById, repetitionModesById),
  );
}
