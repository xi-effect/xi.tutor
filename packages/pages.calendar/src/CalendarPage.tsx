import { useState } from 'react';
import { AddingLessonModal } from 'features.lesson.add';
import { MovingLessonModal, type SoleRescheduleTarget } from 'features.lesson.move';
import { CalendarModule } from 'modules.calendar';
import type { ICalendarEvent } from 'modules.calendar';

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
  const lessonTitle = event.lessonInfo?.description ?? event.title;
  const classroomId = event.lessonInfo?.classroomId;

  const soleTarget: SoleRescheduleTarget | undefined =
    event.scheduler?.eventInstanceId != null && classroomId != null
      ? { classroomId, eventInstanceId: event.scheduler.eventInstanceId }
      : undefined;

  return {
    lessonKind: 'one-off' as const,
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
    soleTarget,
  };
}

export const CalendarPage = () => {
  const [addingModalOpen, setAddingModalOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [moveEvent, setMoveEvent] = useState<ICalendarEvent | null>(null);

  const handleAddLessonClick = (date?: Date) => {
    setInitialDate(date ?? null);
    setAddingModalOpen(true);
  };

  return (
    <>
      <AddingLessonModal
        open={addingModalOpen}
        onOpenChange={setAddingModalOpen}
        dayLessons={[]}
        initialDate={initialDate}
      />
      <CalendarModule
        onAddLessonClick={handleAddLessonClick}
        onLessonReschedule={(event) => setMoveEvent(event)}
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
