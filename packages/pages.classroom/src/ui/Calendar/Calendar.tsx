import { useEffect, useMemo, useState } from 'react';
import {
  ScheduleMobileView,
  useDeleteClassroomEvent,
  useIsMobile,
  useSetEvents,
  useSetEventsLoading,
  useStudentClassroomSchedule,
  useTutorClassroomSchedule,
  useUpdateClassroomEvent,
} from 'modules.calendar';
import type { ChangeLessonFormData, ICalendarEvent, LessonCancelScope } from 'modules.calendar';
import { useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useCurrentUser, useGetClassroom, useGetClassroomStudent } from 'common.services';
import { MovingLessonModal } from 'features.lesson.move';
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

function movingModalPropsFromEvent(event: ICalendarEvent) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const subject = event.lessonInfo?.subject ?? event.title;
  const teacherName = event.lessonInfo?.studentName ?? event.title;
  const lessonTitle = event.lessonInfo?.description ?? event.title;
  return {
    lessonKind: 'one-off' as const,
    initialDate: event.start,
    initialStartTime: event.isAllDay ? null : formatTimeHm(start),
    initialEndTime: event.isAllDay ? null : formatTimeHm(end),
    teacherName,
    subjectLabel: subject,
    lessonTitle,
    lessonDescription: event.lessonInfo?.description,
    formKey: event.id,
    seriesWeekdayIndex: jsWeekdayToSeriesIndex(start),
  };
}

export const Calendar = () => {
  const isMobile = useIsMobile();
  const { weekDays, onAddLessonClick } = useClassroomSchedule();
  const [moveEvent, setMoveEvent] = useState<ICalendarEvent | null>(null);
  const setEvents = useSetEvents();
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
  const deleteClassroomEvent = useDeleteClassroomEvent();
  const updateClassroomEvent = useUpdateClassroomEvent();

  const classroom = isTutor ? tutorQuery.data : studentQuery.data;
  const isLoading = isUserLoading || (isTutor ? tutorQuery.isLoading : studentQuery.isLoading);
  const isError = isTutor ? tutorQuery.isError : studentQuery.isError;
  const scheduleQuery = isTutor ? tutorScheduleQuery : studentScheduleQuery;

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

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить календарь кабинета</p>
      </div>
    );
  }

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

  const handleLessonCancel = (event: ICalendarEvent, scope: LessonCancelScope) => {
    const eventId = event.scheduler?.eventId;
    if (!isTutor || eventId == null) return;

    const instanceKind = event.scheduler?.instanceKind;
    const isSole = instanceKind == null || instanceKind === 'sole';

    if (scope === 'this_occurrence' && !isSole) {
      toast.info(
        'Отмена одного занятия из повторяющейся серии пока недоступна. При необходимости отмените всю серию.',
      );
      return;
    }

    deleteClassroomEvent.mutate({
      classroomId: numericClassroomId,
      eventId,
    });
  };

  return (
    <>
      {isMobile ? (
        <ScheduleMobileView
          onAddLessonClick={onAddLessonClick}
          onLessonReschedule={handleLessonReschedule}
          onLessonCancel={handleLessonCancel}
          onSaveLesson={isTutor ? handleLessonSave : undefined}
          hideLessonCardClassroomAndSubject
        />
      ) : (
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          <CalendarScheduleKanban
            onLessonReschedule={handleLessonReschedule}
            onLessonCancel={handleLessonCancel}
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
          {...movingModalPropsFromEvent(moveEvent)}
        />
      ) : null}
    </>
  );
};
