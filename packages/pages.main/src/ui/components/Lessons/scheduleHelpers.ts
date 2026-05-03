import type { ScheduleItem, ScheduleLessonRow } from 'modules.calendar';
import type { RepeatedVirtualRescheduleTarget, SoleRescheduleTarget } from 'features.lesson.move';

const formatTime = (date: Date): string =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

/**
 * `ScheduleItem` → строка занятия для виджета расписания (`ScheduleLessonRow`).
 * Используется виджетом расписания на главной и `NearestLessonCard`.
 */
export const scheduleItemToLessonRow = (item: ScheduleItem): ScheduleLessonRow => {
  const start = new Date(item.startsAt);
  const end = new Date(item.endsAt);
  const instance = item.eventInstance;
  const eventInstanceId = 'id' in instance ? instance.id : undefined;
  const repetitionModeId =
    'repetition_mode_id' in instance ? instance.repetition_mode_id : undefined;
  const instanceIndex = 'instance_index' in instance ? instance.instance_index : undefined;
  return {
    id: item.eventId,
    classroomId: item.classroomId ?? undefined,
    startAt: start,
    startTime: formatTime(start),
    endTime: formatTime(end),
    subject: item.title,
    description: item.description ?? undefined,
    studentName: '',
    studentId: 0,
    schedulerMeta: {
      eventId: item.eventId,
      instanceKind: item.instanceKind,
      eventInstanceId,
      repetitionModeId,
      instanceIndex,
    },
  };
};

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
