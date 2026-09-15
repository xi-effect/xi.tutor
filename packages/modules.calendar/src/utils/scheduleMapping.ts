import type { ScheduleItem } from 'common.services';
import type { ICalendarEvent } from '../ui/types';
import { addDays, startOfDay } from 'date-fns';
import { toLocalISOString } from './dateTimezone';
import { getScheduleItemRowKey } from './getScheduleItemRowKey';

/**
 * Маппит ScheduleItem (из API расписания) → ICalendarEvent для отображения в календаре/виджетах.
 * Используется и для расписания одного кабинета, и для глобального расписания (без `classroom_id`).
 */
export const mapScheduleItemToCalendarEvent = (item: ScheduleItem): ICalendarEvent => ({
  id: getScheduleItemRowKey(item),
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
    startsAt: item.startsAt,
    eventInstanceId: 'id' in item.eventInstance ? item.eventInstance.id : undefined,
    instanceKind: item.instanceKind,
    repetitionKind: item.repetitionKind,
    repetitionModeId:
      'repetition_mode_id' in item.eventInstance
        ? item.eventInstance.repetition_mode_id
        : undefined,
    instanceIndex: item.instanceIndex,
    cancelledAt: item.cancelledAt,
    weeklyBitmask:
      item.repetitionMode?.kind === 'weekly'
        ? (item.repetitionMode.weekly_starting_bitmask ?? undefined)
        : undefined,
  },
});

export const mapScheduleItemsToCalendarEvents = (items: ScheduleItem[]): ICalendarEvent[] =>
  items.map(mapScheduleItemToCalendarEvent);

/**
 * Диапазон вокруг видимого окна для `happens_after` / `happens_before`.
 * Небольшой запас, чтобы соседние дни/неделя уже были в ответе, пока уходит следующий запрос.
 */
export const SCHEDULE_QUERY_PAST_PAD_DAYS = 7;
export const SCHEDULE_QUERY_FUTURE_PAD_DAYS = 14;

export const getScheduleQueryRange = (
  days: Date[],
): { happensAfter: string; happensBefore: string } => {
  const today = startOfDay(new Date());
  const firstVisible = startOfDay(days[0] ?? today);
  const lastVisible = startOfDay(days[days.length - 1] ?? firstVisible);
  const happensAfter = addDays(firstVisible, -SCHEDULE_QUERY_PAST_PAD_DAYS);
  happensAfter.setHours(0, 0, 0, 0);
  const happensBefore = addDays(lastVisible, SCHEDULE_QUERY_FUTURE_PAD_DAYS);
  happensBefore.setHours(23, 59, 59, 999);
  return {
    happensAfter: toLocalISOString(happensAfter),
    happensBefore: toLocalISOString(new Date(happensBefore.getTime() + 1)),
  };
};
