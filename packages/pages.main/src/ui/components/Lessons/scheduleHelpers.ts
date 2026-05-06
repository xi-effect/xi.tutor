import type { ScheduleItem, ScheduleLessonRow } from 'modules.calendar';
import { mapScheduleItemToLessonRow as scheduleItemToLessonRow } from 'modules.calendar';
import type { RepeatedVirtualRescheduleTarget, SoleRescheduleTarget } from 'features.lesson.move';

export { scheduleItemToLessonRow };

function jsWeekdayToSeriesIndex(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

/**
 * Строит все пропы для `MovingLessonModal` из строки расписания.
 * Автоматически выбирает `schedulerTarget` (repeated_virtual) или `soleTarget` (sole / repeated_persisted),
 * что обеспечивает вызов правильной ручки API при сабмите формы переноса.
 */
export function movingPropsFromLessonRow(lesson: ScheduleLessonRow) {
  const meta = lesson.schedulerMeta;
  const isRepeatedVirtual = meta?.instanceKind === 'repeated_virtual';

  const schedulerTarget: RepeatedVirtualRescheduleTarget | undefined =
    isRepeatedVirtual &&
    lesson.classroomId != null &&
    meta?.repetitionModeId != null &&
    meta?.instanceIndex != null
      ? {
          classroomId: lesson.classroomId,
          eventId: meta.eventId,
          repetitionModeId: meta.repetitionModeId,
          instanceIndex: meta.instanceIndex,
        }
      : undefined;

  const soleTarget: SoleRescheduleTarget | undefined =
    !isRepeatedVirtual && lesson.classroomId != null && meta?.eventInstanceId != null
      ? { classroomId: lesson.classroomId, eventInstanceId: meta.eventInstanceId }
      : undefined;

  return {
    lessonKind: isRepeatedVirtual ? ('recurring' as const) : ('one-off' as const),
    initialDate: lesson.startAt ?? new Date(),
    initialStartTime: lesson.startTime,
    initialEndTime: lesson.endTime,
    classroomId: lesson.classroomId,
    teacherId: lesson.studentId || undefined,
    fallbackName: lesson.studentName || undefined,
    lessonTitle: lesson.subject,
    lessonDescription: lesson.description,
    formKey: `${lesson.id}-${meta?.eventInstanceId ?? meta?.repetitionModeId ?? ''}`,
    seriesWeekdayIndex: lesson.startAt ? jsWeekdayToSeriesIndex(lesson.startAt) : 0,
    weeklyBitmask: lesson.weeklyBitmask,
    schedulerTarget,
    soleTarget,
  };
}

/** Совпадает ли календарный день у инстанса с переданной датой (локальное время). */
export const isOnSameLocalDay = (item: ScheduleItem, day: Date): boolean => {
  const start = new Date(item.startsAt);
  return (
    start.getFullYear() === day.getFullYear() &&
    start.getMonth() === day.getMonth() &&
    start.getDate() === day.getDate()
  );
};
