import { useState } from 'react';
import { ScheduleMobileView, useIsMobile } from 'modules.calendar';
import type { ICalendarEvent } from 'modules.calendar';
import { useParams } from '@tanstack/react-router';
import { useCurrentUser, useGetClassroom, useGetClassroomStudent } from 'common.services';
import { MovingLessonModal } from 'features.lesson.move';
import { useClassroomSchedule } from './ClassroomScheduleContext';
import { CalendarScheduleKanban } from './ClassroomScheduleParts';

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
  const { onAddLessonClick } = useClassroomSchedule();
  const [moveEvent, setMoveEvent] = useState<ICalendarEvent | null>(null);

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const tutorQuery = useGetClassroom(Number(classroomId), isUserLoading || !isTutor);
  const studentQuery = useGetClassroomStudent(Number(classroomId), isUserLoading || isTutor);

  const classroom = isTutor ? tutorQuery.data : studentQuery.data;
  const isLoading = isUserLoading || (isTutor ? tutorQuery.isLoading : studentQuery.isLoading);
  const isError = isTutor ? tutorQuery.isError : studentQuery.isError;

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

  return (
    <>
      {isMobile ? (
        <ScheduleMobileView
          onAddLessonClick={onAddLessonClick}
          onLessonReschedule={handleLessonReschedule}
        />
      ) : (
        <div className="">
          <CalendarScheduleKanban onLessonReschedule={handleLessonReschedule} />
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
