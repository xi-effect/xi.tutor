import type { ScheduleLessonRow } from '../ui/types';
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
