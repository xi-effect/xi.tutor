import type { EventInstanceDto } from 'common.api';
import type { ScheduleItem } from './types';

export function mapEventInstanceToScheduleItem(
  eventInstance: EventInstanceDto,
  classroomId: number | null,
): ScheduleItem {
  const cancelledAt = 'cancelled_at' in eventInstance ? eventInstance.cancelled_at : null;
  const instanceIndex = 'instance_index' in eventInstance ? eventInstance.instance_index : null;

  return {
    eventId: eventInstance.event_id,
    startsAt: eventInstance.starts_at,
    endsAt: eventInstance.ends_at,
    title: eventInstance.name,
    description: eventInstance.description ?? null,
    classroomId: eventInstance.classroom_id ?? eventInstance.event?.classroom_id ?? classroomId,
    eventInstance,
    event: eventInstance.event,
    repetitionMode: undefined,
    instanceKind: eventInstance.kind,
    repetitionKind: null,
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
