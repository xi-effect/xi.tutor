import { useCallback, useState } from 'react';
import { LessonInfoModal } from 'features.lesson.info';
import type { ICalendarEvent } from '../ui/types';
import { timeToString } from '../utils';

function mapEventToLessonInfo(event: ICalendarEvent) {
  const startTime = event.isAllDay ? null : timeToString(new Date(event.start));
  const endTime = event.isAllDay ? null : timeToString(new Date(event.end));
  const subject = event.lessonInfo?.subject ?? event.title;
  const teacherName = event.lessonInfo?.studentName ?? event.title;
  const teacherId = event.lessonInfo?.teacherId;
  const lessonTitle = event.lessonInfo?.description ?? event.title;
  return { subject, teacherName, teacherId, lessonTitle, startTime, endTime };
}

export type UseLessonInfoModalOptions = {
  onStartLesson?: (event: ICalendarEvent) => void;
  onReschedule?: (event: ICalendarEvent) => void;
  onCancelLesson?: (event: ICalendarEvent) => void;
};

/**
 * Одна модалка «Информация о занятии» на выбранное событие — для канбана и мобильного списка.
 */
export const useLessonInfoModal = ({
  onStartLesson,
  onReschedule,
  onCancelLesson,
}: UseLessonInfoModalOptions = {}) => {
  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | null>(null);

  const close = useCallback(() => setSelectedEvent(null), []);

  const lessonInfoModal =
    selectedEvent != null ? (
      <LessonInfoModal
        open
        onOpenChange={(o) => {
          if (!o) close();
        }}
        {...mapEventToLessonInfo(selectedEvent)}
        onStartLesson={() => onStartLesson?.(selectedEvent)}
        onReschedule={() => onReschedule?.(selectedEvent)}
        onCancelLesson={() => onCancelLesson?.(selectedEvent)}
      />
    ) : null;

  return {
    openLessonInfo: setSelectedEvent,
    closeLessonInfo: close,
    lessonInfoModal,
  };
};
