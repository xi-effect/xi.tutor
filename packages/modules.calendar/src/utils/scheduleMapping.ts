import type { ScheduleItem } from 'common.services';
import type { ICalendarEvent } from '../ui/types';
import { toLocalISOString } from './dateTimezone';
import { getScheduleItemRowKey } from './getScheduleItemRowKey';
import { startOfDay } from 'date-fns';

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
 * Диапазон [startOfFirst, endOfLast + 1ms] в ISO для query params `happens_after` / `happens_before`.
 * Всегда включает сегодня — нужно для корректного поиска ближайшего занятия вне видимого окна.
 */
export const getScheduleQueryRange = (
  days: Date[],
): { happensAfter: string; happensBefore: string } => {
  const today = startOfDay(new Date());
  const firstVisible = startOfDay(days[0] ?? today);
  const lastVisible = startOfDay(days[days.length - 1] ?? firstVisible);
  const happensAfter = new Date(Math.min(firstVisible.getTime(), today.getTime()));
  happensAfter.setHours(0, 0, 0, 0);
  const happensBefore = new Date(Math.max(lastVisible.getTime(), today.getTime()));
  happensBefore.setHours(23, 59, 59, 999);
  return {
    // Отправляем в timezone пользователя: бэкенд принимает timestamp с любым offset
    happensAfter: toLocalISOString(happensAfter),
    happensBefore: toLocalISOString(new Date(happensBefore.getTime() + 1)),
  };
};
