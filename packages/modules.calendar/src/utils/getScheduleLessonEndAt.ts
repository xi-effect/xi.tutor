import type { ScheduleLessonRow } from '../ui/types';

/** Момент окончания слота по `endTime` и дню (`startAt` или `lessonDay`). */
export function getScheduleLessonEndAt(lesson: ScheduleLessonRow, lessonDay?: Date): Date | null {
  const [h, m] = lesson.endTime.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  if (lesson.startAt != null) {
    const d = new Date(lesson.startAt);
    d.setHours(h, m, 0, 0);
    return d;
  }
  if (lessonDay == null) return null;
  const d = new Date(lessonDay);
  d.setHours(0, 0, 0, 0);
  d.setHours(h, m, 0, 0);
  return d;
}
