import type { EventInstanceDto, RepetitionModeDto } from 'common.api';
import type { ScheduleItem } from './types';

export function mapEventInstanceToScheduleItem(
  eventInstance: EventInstanceDto,
  classroomId: number | null,
): ScheduleItem {
  const cancelledAt = 'cancelled_at' in eventInstance ? eventInstance.cancelled_at : null;
  const instanceIndex = 'instance_index' in eventInstance ? eventInstance.instance_index : null;
  // DetailedEventInstanceDto (глобальное расписание) содержит вложенный repetition_mode
  const repetitionMode: RepetitionModeDto | undefined =
    'repetition_mode' in eventInstance
      ? (eventInstance.repetition_mode as RepetitionModeDto | undefined)
      : undefined;

  return {
    eventId: eventInstance.event_id,
    startsAt: eventInstance.starts_at,
    endsAt: eventInstance.ends_at,
    title: eventInstance.name,
    description: eventInstance.description ?? null,
    classroomId: eventInstance.classroom_id ?? eventInstance.event?.classroom_id ?? classroomId,
    eventInstance,
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
  response: EventInstanceDto[],
  classroomId: number | null,
): ScheduleItem[] {
  return response.map((instance) => mapEventInstanceToScheduleItem(instance, classroomId));
}
