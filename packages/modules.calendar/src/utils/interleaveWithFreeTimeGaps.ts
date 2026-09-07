import type { ScheduleLessonRow } from '../ui/types';
import { getScheduleLessonEndAt } from './getScheduleLessonEndAt';
import { getScheduleLessonStartAt } from './getScheduleLessonStartAt';

export type TimedFeedItem<T> =
  | { kind: 'item'; item: T; index: number }
  | { kind: 'gap'; start: Date; end: Date }
  | { kind: 'overlap'; start: Date; end: Date };

/**
 * Вставляет свободные окна и предупреждения о наложении между соседними слотами.
 * Занятое время считается по максимуму окончания.
 */
export function interleaveWithFreeTimeGaps<T>(
  items: T[],
  getRange: (item: T) => { start: Date; end: Date } | null,
): TimedFeedItem<T>[] {
  const result: TimedFeedItem<T>[] = [];
  let occupiedUntil: Date | null = null;

  items.forEach((item, index) => {
    const range = getRange(item);
    if (occupiedUntil != null && range != null) {
      const startMs = range.start.getTime();
      const occupiedMs = occupiedUntil.getTime();
      if (startMs < occupiedMs) {
        result.push({
          kind: 'overlap',
          start: range.start,
          end: new Date(Math.min(range.end.getTime(), occupiedMs)),
        });
      } else if (startMs > occupiedMs) {
        result.push({ kind: 'gap', start: occupiedUntil, end: range.start });
      }
    }
    result.push({ kind: 'item', item, index });
    if (range != null && (occupiedUntil == null || range.end.getTime() > occupiedUntil.getTime())) {
      occupiedUntil = range.end;
    }
  });

  return result;
}

export function interleaveLessonRowsWithFreeTimeGaps(
  lessons: ScheduleLessonRow[],
  dayDate?: Date,
): TimedFeedItem<ScheduleLessonRow>[] {
  return interleaveWithFreeTimeGaps(lessons, (lesson) => {
    const start = getScheduleLessonStartAt(lesson, dayDate);
    const end = getScheduleLessonEndAt(lesson, dayDate);
    if (start == null || end == null || end.getTime() <= start.getTime()) return null;
    return { start, end };
  });
}
