import type { ICalendarEvent, ScheduleLessonRow } from '../ui/types';
import { getScheduleLessonEndAt } from './getScheduleLessonEndAt';

/** Первое занятие, которое ещё не закончилось (текущее или ближайшее). */
export const findNearestLessonIndex = (
  lessons: ScheduleLessonRow[],
  now: Date,
  dayDate: Date,
): number => {
  for (let i = 0; i < lessons.length; i++) {
    const end = getScheduleLessonEndAt(lessons[i], dayDate);
    if (end != null && now < end) {
      return i;
    }
  }
  return -1;
};

/** id текущего или ближайшего занятия среди событий календаря (канбан, мобильный список). */
export const findNearestCalendarEventId = (
  events: ICalendarEvent[],
  now: Date = new Date(),
): string | null => {
  const nowMs = now.getTime();
  let ongoingId: string | null = null;
  let ongoingStartMs = -Infinity;
  let upcomingId: string | null = null;
  let upcomingStartMs = Infinity;

  for (const event of events) {
    if (event.isCancelled || event.isAllDay) continue;
    const startMs = new Date(event.start).getTime();
    const endMs = new Date(event.end).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || nowMs >= endMs) continue;

    if (startMs <= nowMs) {
      // Идёт сейчас — берём то, что началось последним (актуальное занятие)
      if (startMs > ongoingStartMs) {
        ongoingStartMs = startMs;
        ongoingId = event.id;
      }
    } else if (startMs < upcomingStartMs) {
      upcomingStartMs = startMs;
      upcomingId = event.id;
    }
  }

  return ongoingId ?? upcomingId;
};

/** Ближайшее занятие, если оно попадает в видимые колонки канбана */
export const findNearestVisibleCalendarEventId = (
  allEvents: ICalendarEvent[],
  visibleEvents: ICalendarEvent[],
  now: Date = new Date(),
): string | null => {
  const nearestId = findNearestCalendarEventId(allEvents, now);
  if (nearestId == null) return null;
  return visibleEvents.some((event) => event.id === nearestId) ? nearestId : null;
};
