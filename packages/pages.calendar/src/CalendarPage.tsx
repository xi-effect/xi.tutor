import { useEffect, useMemo, useState } from 'react';
import { AddingLessonModal } from 'features.lesson.add';
import {
  MovingLessonModal,
  type RepeatedVirtualRescheduleTarget,
  type SoleRescheduleTarget,
} from 'features.lesson.move';
import {
  CalendarModule,
  CalendarScheduleProvider,
  getScheduleQueryRange,
  mapScheduleItemsToCalendarEvents,
  useCalendarSchedule,
  useSetEvents,
  useSetEventsLoading,
  useStudentSchedule,
  useTutorSchedule,
} from 'modules.calendar';
import type { ChangeLessonFormData, ICalendarEvent } from 'modules.calendar';
import { useCurrentUser, useUpdateClassroomEvent } from 'common.services';

function jsWeekdayToSeriesIndex(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

function formatTimeHm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function movingModalPropsFromEvent(event: ICalendarEvent) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const lessonTitle = event.title;
  const classroomId = event.lessonInfo?.classroomId;
  const instanceKind = event.scheduler?.instanceKind;
  const isRepeatedVirtual = instanceKind === 'repeated_virtual';

  const schedulerTarget: RepeatedVirtualRescheduleTarget | undefined =
    isRepeatedVirtual &&
    classroomId != null &&
    event.scheduler?.repetitionModeId != null &&
    event.scheduler.instanceIndex != null
      ? {
          classroomId,
          eventId: event.scheduler.eventId,
          repetitionModeId: event.scheduler.repetitionModeId,
          instanceIndex: event.scheduler.instanceIndex,
        }
      : undefined;

  const soleTarget: SoleRescheduleTarget | undefined =
    !isRepeatedVirtual && event.scheduler?.eventInstanceId != null && classroomId != null
      ? { classroomId, eventInstanceId: event.scheduler.eventInstanceId }
      : undefined;

  return {
    lessonKind: isRepeatedVirtual ? ('recurring' as const) : ('one-off' as const),
    initialDate: event.start,
    initialStartTime: event.isAllDay ? null : formatTimeHm(start),
    initialEndTime: event.isAllDay ? null : formatTimeHm(end),
    classroomId,
    teacherId: event.lessonInfo?.teacherId,
    fallbackName: event.lessonInfo?.studentName ?? event.title,
    lessonTitle,
    lessonDescription: event.lessonInfo?.description,
    formKey: event.id,
    seriesWeekdayIndex: jsWeekdayToSeriesIndex(start),
    weeklyBitmask: event.scheduler?.weeklyBitmask,
    schedulerTarget,
    soleTarget,
  };
}

const CalendarPageContent = () => {
  const [addingModalOpen, setAddingModalOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [moveEvent, setMoveEvent] = useState<ICalendarEvent | null>(null);

  const { visibleDays } = useCalendarSchedule();
  const range = useMemo(() => getScheduleQueryRange(visibleDays), [visibleDays]);

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const tutorScheduleQuery = useTutorSchedule({
    ...range,
    enabled: !isUserLoading && isTutor === true,
  });
  const studentScheduleQuery = useStudentSchedule({
    ...range,
    enabled: !isUserLoading && isTutor === false,
  });

  const scheduleQuery = isTutor ? tutorScheduleQuery : studentScheduleQuery;

  const setEvents = useSetEvents();
  const setEventsLoading = useSetEventsLoading();

  useEffect(() => {
    setEventsLoading(scheduleQuery.isLoading || scheduleQuery.isFetching);
  }, [scheduleQuery.isFetching, scheduleQuery.isLoading, setEventsLoading]);

  useEffect(() => {
    if (scheduleQuery.data) {
      setEvents(mapScheduleItemsToCalendarEvents(scheduleQuery.data));
      return;
    }
    if (scheduleQuery.isError) {
      setEvents([]);
    }
  }, [scheduleQuery.data, scheduleQuery.isError, setEvents]);

  useEffect(() => () => setEvents([]), [setEvents]);

  const updateClassroomEvent = useUpdateClassroomEvent();

  const handleAddLessonClick = (date?: Date) => {
    setInitialDate(date ?? null);
    setAddingModalOpen(true);
  };

  const handleSaveLesson = (event: ICalendarEvent, data: ChangeLessonFormData) => {
    const classroomId = event.lessonInfo?.classroomId;
    if (!isTutor || classroomId == null) return;
    const eventId = event.scheduler?.eventId;
    if (eventId == null) return;

    const description = data.description?.trim() ?? '';
    updateClassroomEvent.mutate({
      classroomId,
      eventId,
      body: {
        name: data.title.trim(),
        description: description === '' ? null : description,
      },
    });
  };

  return (
    <>
      {isTutor ? (
        <AddingLessonModal
          open={addingModalOpen}
          onOpenChange={setAddingModalOpen}
          initialDate={initialDate}
        />
      ) : null}
      <CalendarModule
        onAddLessonClick={isTutor ? handleAddLessonClick : undefined}
        onLessonReschedule={(event) => setMoveEvent(event)}
        onSaveLesson={isTutor ? handleSaveLesson : undefined}
      />
      {moveEvent != null ? (
        <MovingLessonModal
          key={moveEvent.id}
          open
          onOpenChange={(open) => {
            if (!open) setMoveEvent(null);
          }}
          {...movingModalPropsFromEvent(moveEvent)}
        />
      ) : null}
    </>
  );
};

export const CalendarPage = () => (
  <CalendarScheduleProvider>
    <CalendarPageContent />
  </CalendarScheduleProvider>
);
