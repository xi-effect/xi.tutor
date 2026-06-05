import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScheduleMobileView,
  useAddEvent,
  useIsMobile,
  useLessonInfoModal,
  useSetEvents,
  useSetEventsLoading,
  useStudentClassroomSchedule,
  useTutorClassroomSchedule,
  useUpdateClassroomEvent,
} from 'modules.calendar';
import type { ChangeLessonFormData, ICalendarEvent } from 'modules.calendar';
import { useParams } from '@tanstack/react-router';
import { useCurrentUser, useGetClassroom, useGetClassroomStudent } from 'common.services';
import {
  MovingLessonModal,
  type RepeatedVirtualRescheduleTarget,
  type SoleRescheduleTarget,
} from 'features.lesson.move';
import { useClassroomSchedule } from './ClassroomScheduleContext';
import { CalendarScheduleKanban } from './ClassroomScheduleParts';
import { getScheduleQueryRange, mapScheduleItemsToCalendarEvents } from './schedulerMapping';

function jsWeekdayToSeriesIndex(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

function formatTimeHm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const eventInstanceKey = (event: ICalendarEvent): string =>
  event.scheduler?.eventInstanceId ?? event.id;

/** Диплинк: событие из GET details может ещё не быть в списке расписания после invalidate */
function upsertEventInList(events: ICalendarEvent[], extra: ICalendarEvent): ICalendarEvent[] {
  const key = eventInstanceKey(extra);
  const without = events.filter((e) => eventInstanceKey(e) !== key);
  return [...without, extra].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
}

function movingModalPropsFromEvent(event: ICalendarEvent, classroomId: number) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const lessonTitle = event.title;
  const instanceKind = event.scheduler?.instanceKind;
  const isRepeatedVirtual = instanceKind === 'repeated_virtual';

  const schedulerTarget: RepeatedVirtualRescheduleTarget | undefined =
    isRepeatedVirtual &&
    event.scheduler?.repetitionModeId != null &&
    event.scheduler.instanceIndex != null
      ? {
          classroomId,
          eventId: event.scheduler.eventId,
          repetitionModeId: event.scheduler.repetitionModeId,
          instanceIndex: event.scheduler.instanceIndex,
        }
      : undefined;

  const hasSoleId = event.scheduler?.eventInstanceId != null;
  const soleTarget: SoleRescheduleTarget | undefined =
    !isRepeatedVirtual && hasSoleId
      ? { classroomId, eventInstanceId: event.scheduler!.eventInstanceId! }
      : undefined;

  return {
    lessonKind: isRepeatedVirtual ? ('recurring' as const) : ('one-off' as const),
    initialDate: event.start,
    initialStartTime: event.isAllDay ? null : formatTimeHm(start),
    initialEndTime: event.isAllDay ? null : formatTimeHm(end),
    classroomId: event.lessonInfo?.classroomId ?? classroomId,
    teacherId: event.lessonInfo?.teacherId,
    fallbackName: event.lessonInfo?.studentName ?? event.title,
    lessonTitle,
    lessonDescription: event.lessonInfo?.description,
    formKey: event.id,
    seriesWeekdayIndex: jsWeekdayToSeriesIndex(start),
    weeklyBitmask: event.scheduler?.weeklyBitmask,
    repetitionKind: event.scheduler?.repetitionKind ?? null,
    schedulerTarget,
    soleTarget,
  };
}

export const Calendar = () => {
  const isMobile = useIsMobile();
  const {
    weekDays,
    onAddLessonClick,
    pendingEventToOpen,
    pendingAnchorDate,
    acknowledgePendingLessonOpen,
    mobileScheduleAnchorTs,
  } = useClassroomSchedule();

  const [moveEvent, setMoveEvent] = useState<ICalendarEvent | null>(null);
  const deepLinkEventRef = useRef<ICalendarEvent | null>(null);
  const setEvents = useSetEvents();
  const addEvent = useAddEvent();
  const setEventsLoading = useSetEventsLoading();

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const numericClassroomId = Number(classroomId);
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const scheduleRange = useMemo(() => getScheduleQueryRange(weekDays), [weekDays]);

  const tutorQuery = useGetClassroom(numericClassroomId, isUserLoading || !isTutor);
  const studentQuery = useGetClassroomStudent(numericClassroomId, isUserLoading || isTutor);
  const tutorScheduleQuery = useTutorClassroomSchedule({
    classroomId: numericClassroomId,
    ...scheduleRange,
    enabled: !isUserLoading && isTutor === true,
  });
  const studentScheduleQuery = useStudentClassroomSchedule({
    classroomId: numericClassroomId,
    ...scheduleRange,
    enabled: !isUserLoading && isTutor === false,
  });
  const updateClassroomEvent = useUpdateClassroomEvent();

  const classroom = isTutor ? tutorQuery.data : studentQuery.data;
  const isError = isTutor ? tutorQuery.isError : studentQuery.isError;
  const scheduleQuery = isTutor ? tutorScheduleQuery : studentScheduleQuery;

  const handleLessonReschedule = (event: ICalendarEvent) => {
    setMoveEvent(event);
  };

  const handleLessonSave = (event: ICalendarEvent, data: ChangeLessonFormData) => {
    if (!isTutor) return;
    const eventId = event.scheduler?.eventId;
    if (eventId == null) return;

    const description = data.description?.trim() ?? '';
    updateClassroomEvent.mutate({
      classroomId: numericClassroomId,
      eventId,
      body: {
        name: data.title.trim(),
        description: description === '' ? null : description,
      },
    });
  };

  const { openLessonInfo, lessonInfoModal } = useLessonInfoModal({
    onReschedule: handleLessonReschedule,
    onSaveLesson: isTutor ? handleLessonSave : undefined,
  });

  // Переключение недели — в ClassroomScheduleProvider (useLayoutEffect + goToDay)

  // Показываем занятие в сетке и открываем модалку (данные из GET details)
  useEffect(() => {
    if (pendingEventToOpen == null) return;
    deepLinkEventRef.current = pendingEventToOpen;
    addEvent(pendingEventToOpen);
    openLessonInfo(pendingEventToOpen);
    acknowledgePendingLessonOpen();
  }, [pendingEventToOpen, addEvent, openLessonInfo, acknowledgePendingLessonOpen]);

  useEffect(() => {
    setEventsLoading(scheduleQuery.isLoading || scheduleQuery.isFetching);
  }, [scheduleQuery.isFetching, scheduleQuery.isLoading, setEventsLoading]);

  useEffect(() => {
    if (scheduleQuery.data) {
      let events = mapScheduleItemsToCalendarEvents(scheduleQuery.data);
      const deepLink = deepLinkEventRef.current;
      if (deepLink != null) {
        const key = eventInstanceKey(deepLink);
        if (events.some((e) => eventInstanceKey(e) === key)) {
          deepLinkEventRef.current = null;
        } else {
          events = upsertEventInList(events, deepLink);
        }
      }
      setEvents(events);
      return;
    }
    if (scheduleQuery.isError) {
      setEvents(deepLinkEventRef.current != null ? [deepLinkEventRef.current] : []);
    }
  }, [scheduleQuery.data, scheduleQuery.isError, setEvents]);

  useEffect(() => () => setEvents([]), [setEvents]);

  const hasPendingDeepLink = pendingEventToOpen != null || pendingAnchorDate != null;
  const isClassroomLoading =
    isUserLoading || (isTutor ? tutorQuery.isLoading : studentQuery.isLoading);

  if (isClassroomLoading && !hasPendingDeepLink) {
    return (
      <div className="flex flex-col">
        <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (isError || (!classroom && !hasPendingDeepLink)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить календарь кабинета</p>
      </div>
    );
  }

  return (
    <>
      {lessonInfoModal}
      {isMobile ? (
        <ScheduleMobileView
          key={numericClassroomId}
          onAddLessonClick={onAddLessonClick}
          onLessonReschedule={handleLessonReschedule}
          onSaveLesson={isTutor ? handleLessonSave : undefined}
          hideLessonCardClassroomAndSubject
          mobileScheduleAnchorTs={mobileScheduleAnchorTs}
        />
      ) : (
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          <CalendarScheduleKanban
            onLessonReschedule={handleLessonReschedule}
            onSaveLesson={isTutor ? handleLessonSave : undefined}
          />
        </div>
      )}
      {moveEvent != null ? (
        <MovingLessonModal
          key={moveEvent.id}
          open
          onOpenChange={(open) => {
            if (!open) setMoveEvent(null);
          }}
          {...movingModalPropsFromEvent(moveEvent, numericClassroomId)}
        />
      ) : null}
    </>
  );
};
