import type { ScheduleItem } from 'common.services';
import type { ScheduleLessonRow } from '../ui/types';

const formatTime = (d: Date): string =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** `ScheduleItem` → строка для списка дня (`ScheduleLessonRow`). */
export const mapScheduleItemToLessonRow = (item: ScheduleItem): ScheduleLessonRow => {
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
    studentName: item.title,
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
