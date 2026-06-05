import type { DetailedEventInstanceDto, EventInstanceDto, RepetitionModeDto } from 'common.api';
import type { ScheduleItem } from './types';

type AnyEventInstanceDto = EventInstanceDto | DetailedEventInstanceDto;

export function mapEventInstanceToScheduleItem(
  eventInstance: AnyEventInstanceDto,
  classroomId: number | null,
): ScheduleItem {
  const cancelledAt = 'cancelled_at' in eventInstance ? eventInstance.cancelled_at : null;
  const instanceIndex = 'instance_index' in eventInstance ? eventInstance.instance_index : null;
  // DetailedEventInstanceDto содержит вложенный repetition_mode
  const repetitionMode: RepetitionModeDto | undefined =
    'repetition_mode' in eventInstance
      ? (eventInstance.repetition_mode as RepetitionModeDto | undefined)
      : undefined;

  // Details-endpoint может не возвращать name на верхнем уровне — берём из вложенного event
  const title = eventInstance.name ?? eventInstance.event?.name ?? '';

  return {
    eventId: eventInstance.event_id,
    startsAt: eventInstance.starts_at,
    endsAt: eventInstance.ends_at,
    title,
    description: eventInstance.description ?? null,
    classroomId: eventInstance.classroom_id ?? eventInstance.event?.classroom_id ?? classroomId,
    eventInstance: eventInstance as EventInstanceDto,
    event: eventInstance.event,
    repetitionMode,
    instanceKind: eventInstance.kind,
    repetitionKind: repetitionMode?.kind ?? null,
    instanceIndex,
    cancelledAt,
    isSingle: eventInstance.kind === 'sole',
    isRepeatedVirtual: eventInstance.kind === 'repeated_virtual',
    isRepeatedPersistent: eventInstance.kind === 'repeated_persisted',
  };
}

export function mapScheduleResponseToScheduleItems(
  response: AnyEventInstanceDto[],
  classroomId: number | null,
): ScheduleItem[] {
  return response.map((instance) => mapEventInstanceToScheduleItem(instance, classroomId));
}
