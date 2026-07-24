import type { GetEventInstanceDetailsResponseDto } from 'common.api';
import { extractInstanceSlot } from 'common.services';
import { getDateLocale } from 'common.ui';
import type { FormData as AddingLessonFormData } from 'features.lesson.add';
import { durationBetweenMinutes } from 'features.lesson.add';
import type {
  CreateClassroomEventRequestDto,
  ICalendarEvent,
  ScheduleItem,
  ScheduleLessonRow,
} from 'modules.calendar';
import { resolveSchedulerStartsAt } from 'modules.calendar';
import { startOfDay } from 'date-fns';

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

const durationBetweenToSeconds = (startTime: string, endTime: string): number =>
  durationBetweenMinutes(startTime, endTime) * 60;

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
 * Событие для модалки из реального ответа GET event-instances/{id}/.
 *
 * API возвращает вложенную структуру:
 *   { event: { name, id, ... }, kind, persisted_event_instance: { id, starts_at, ... } }
 */
export const mapInstanceDetailsToCalendarEvent = (
  details: GetEventInstanceDetailsResponseDto,
  classroomId: number,
): ICalendarEvent => {
  const event = details.event;
  const slot = extractInstanceSlot(details);

  if (slot == null || event == null) {
    const fallbackStart = new Date();
    const fallbackEnd = new Date(fallbackStart.getTime() + 60 * 60 * 1000);
    return {
      id: 'unknown',
      title: '',
      start: fallbackStart,
      end: fallbackEnd,
      type: 'lesson',
      lessonInfo: { studentName: '', lessonType: 'individual', classroomId },
    };
  }

  let repetitionModeId: string | undefined;
  let instanceIndex: number | null = null;

  if (details.kind === 'repeated_virtual') {
    repetitionModeId = details.repetition_mode_id;
    instanceIndex = details.instance_index;
  }

  const { startsAt, endsAt, instanceId, cancelledAt } = slot;
  const title = event.name ?? '';
  const effectiveClassroomId = event.classroom_id ?? classroomId;

  return {
    id: instanceId ?? `${event.id}:${details.kind}:${instanceIndex ?? 'unknown'}:${startsAt}`,
    title,
    start: new Date(startsAt),
    end: new Date(endsAt),
    type: 'lesson',
    isCancelled: cancelledAt != null,
    lessonInfo: {
      studentName: title,
      lessonType: 'individual',
      description: event.description ?? undefined,
      classroomId: effectiveClassroomId ?? undefined,
    },
    scheduler: {
      eventId: event.id,
      startsAt,
      eventInstanceId: instanceId,
      instanceKind: details.kind,
      repetitionKind: details.kind !== 'sole' ? 'weekly' : null,
      repetitionModeId,
      instanceIndex: instanceIndex ?? undefined,
      cancelledAt,
    },
  };
};

export const mapCalendarEventsToDayLessons = (events: ICalendarEvent[]): ScheduleLessonRow[] =>
  events.map((event) => ({
    id: event.scheduler?.eventId ?? Number(event.id),
    classroomId: event.lessonInfo?.classroomId,
    startAt: event.start,
    startTime: event.start.toLocaleTimeString(getDateLocale(), {
      hour: '2-digit',
      minute: '2-digit',
    }),
    endTime: event.end.toLocaleTimeString(getDateLocale(), {
      hour: '2-digit',
      minute: '2-digit',
    }),
    subject: event.lessonInfo?.subject ?? event.title,
    description: event.lessonInfo?.description,
    studentName: event.lessonInfo?.studentName ?? event.title,
    studentId: event.lessonInfo?.teacherId ?? 0,
    weeklyBitmask: event.scheduler?.weeklyBitmask,
    schedulerMeta: event.scheduler
      ? {
          eventId: event.scheduler.eventId,
          startsAt: resolveSchedulerStartsAt(event.scheduler.startsAt, event.start),
          instanceKind: event.scheduler.instanceKind,
          eventInstanceId: event.scheduler.eventInstanceId,
          repetitionModeId: event.scheduler.repetitionModeId,
          instanceIndex: event.scheduler.instanceIndex,
          repetitionKind: event.scheduler.repetitionKind,
        }
      : undefined,
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
  const today = startOfDay(new Date());
  const firstVisible = startOfDay(days[0] ?? today);
  const lastVisible = startOfDay(days[days.length - 1] ?? firstVisible);
  const happensAfter = new Date(Math.min(firstVisible.getTime(), today.getTime()));
  happensAfter.setHours(0, 0, 0, 0);

  const happensBefore = new Date(Math.max(lastVisible.getTime(), today.getTime()));
  happensBefore.setHours(23, 59, 59, 999);

  return {
    happensAfter: happensAfter.toISOString(),
    happensBefore: new Date(happensBefore.getTime() + MS_PER_SECOND).toISOString(),
  };
};
