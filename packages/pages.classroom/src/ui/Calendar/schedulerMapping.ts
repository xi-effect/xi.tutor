import type { FormData as AddingLessonFormData } from 'features.lesson.add';
import type {
  CreateClassroomEventRequestDto,
  ICalendarEvent,
  ScheduleItem,
  ScheduleLessonRow,
} from 'modules.calendar';

const MS_PER_SECOND = 1000;
const WEEKDAY_TO_BIT = [1, 2, 4, 8, 16, 32, 64] as const;

const parseTimeParts = (time: string): [number, number] => {
  const [hours = '0', minutes = '0'] = time.split(':');
  return [Number(hours), Number(minutes)];
};

const combineDateAndTime = (date: Date, time: string): Date => {
  const [hours, minutes] = parseTimeParts(time);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const durationBetweenToSeconds = (startTime: string, endTime: string): number => {
  const [startHours, startMinutes] = parseTimeParts(startTime);
  const [endHours, endMinutes] = parseTimeParts(endTime);
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  return (endTotalMinutes - startTotalMinutes) * 60;
};

const getCalendarEventId = (item: ScheduleItem): string => {
  const instance = item.eventInstance;

  if ('id' in instance) {
    return instance.id;
  }

  return `${item.eventId}:${item.instanceKind}:${item.instanceIndex ?? 'unknown'}:${item.startsAt}`;
};

export const mapScheduleItemToCalendarEvent = (item: ScheduleItem): ICalendarEvent => ({
  id: getCalendarEventId(item),
  title: item.title,
  start: new Date(item.startsAt),
  end: new Date(item.endsAt),
  type: 'lesson',
  isCancelled: item.cancelledAt != null,
  lessonInfo: {
    studentName: item.title,
    subject: item.title,
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

export const mapCalendarEventsToDayLessons = (events: ICalendarEvent[]): ScheduleLessonRow[] =>
  events.map((event) => ({
    id: event.scheduler?.eventId ?? Number(event.id),
    classroomId: event.lessonInfo?.classroomId,
    startAt: event.start,
    startTime: event.start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    endTime: event.end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    subject: event.lessonInfo?.subject ?? event.title,
    description: event.lessonInfo?.description,
    studentName: event.lessonInfo?.studentName ?? event.title,
    studentId: event.lessonInfo?.teacherId ?? 0,
    instanceKind: event.scheduler?.instanceKind,
  }));

export const buildCreateClassroomEventRequest = (
  data: AddingLessonFormData,
): CreateClassroomEventRequestDto => {
  const startsAt = combineDateAndTime(data.startDate, data.startTime);
  const durationSeconds = durationBetweenToSeconds(data.startTime, data.endTime);
  const descriptionTrimmed = data.description?.trim() ?? '';
  const event = {
    name: data.title,
    description: descriptionTrimmed.length > 0 ? descriptionTrimmed : null,
  };

  if (data.repeatMode === 'none') {
    return {
      kind: 'single',
      event,
      sole_instance: {
        starts_at: startsAt.toISOString(),
        duration_seconds: durationSeconds,
      },
    };
  }

  const selectedDays = data.repeatDays.length > 0 ? data.repeatDays : [(startsAt.getDay() + 6) % 7];
  const weeklyBitmask = selectedDays.reduce((mask, day) => mask | WEEKDAY_TO_BIT[day], 0);

  return {
    kind: 'repeating',
    event,
    repetition_mode: {
      kind: 'weekly',
      starts_at: startsAt.toISOString(),
      duration_seconds: durationSeconds,
      weekly_bitmask: weeklyBitmask,
    },
  };
};

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
    happensBefore: new Date(happensBefore.getTime() + MS_PER_SECOND).toISOString(),
  };
};
