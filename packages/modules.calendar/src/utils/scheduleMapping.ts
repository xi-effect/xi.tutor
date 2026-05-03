import type { ScheduleItem } from 'common.services';
import type { ICalendarEvent } from '../ui/types';

const getCalendarEventId = (item: ScheduleItem): string => {
  const instance = item.eventInstance;
  if ('id' in instance) {
    return instance.id;
  }
  return `${item.eventId}:${item.instanceKind}:${item.instanceIndex ?? 'unknown'}:${item.startsAt}`;
};

/**
 * Маппит ScheduleItem (из API расписания) → ICalendarEvent для отображения в календаре/виджетах.
 * Используется и для расписания одного кабинета, и для глобального расписания (без `classroom_id`).
 */
export const mapScheduleItemToCalendarEvent = (item: ScheduleItem): ICalendarEvent => ({
  id: getCalendarEventId(item),
  title: item.title,
  start: new Date(item.startsAt),
  end: new Date(item.endsAt),
  type: 'lesson',
  isCancelled: item.cancelledAt != null,
  lessonInfo: {
    studentName: item.title,
    lessonType: 'individual',
    description: item.description ?? undefined,
    classroomId: item.classroomId ?? undefined,
  },
  scheduler: {
    eventId: item.eventId,
    eventInstanceId: 'id' in item.eventInstance ? item.eventInstance.id : undefined,
    instanceKind: item.instanceKind,
    repetitionKind: item.repetitionKind,
    repetitionModeId:
      'repetition_mode_id' in item.eventInstance
        ? item.eventInstance.repetition_mode_id
        : undefined,
    instanceIndex: item.instanceIndex,
    cancelledAt: item.cancelledAt,
  },
});

export const mapScheduleItemsToCalendarEvents = (items: ScheduleItem[]): ICalendarEvent[] =>
  items.map(mapScheduleItemToCalendarEvent);

/**
 * Диапазон [startOfFirst, endOfLast + 1ms] в ISO для query params `happens_after` / `happens_before`.
 */
export const getScheduleQueryRange = (
  days: Date[],
): { happensAfter: string; happensBefore: string } => {
  const firstDay = days[0] ?? new Date();
  const lastDay = days[days.length - 1] ?? firstDay;
  const happensAfter = new Date(firstDay);
  happensAfter.setHours(0, 0, 0, 0);
  const happensBefore = new Date(lastDay);
  happensBefore.setHours(23, 59, 59, 999);
  return {
    happensAfter: happensAfter.toISOString(),
    happensBefore: new Date(happensBefore.getTime() + 1).toISOString(),
  };
};
