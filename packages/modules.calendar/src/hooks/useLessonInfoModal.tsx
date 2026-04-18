import { useCallback, useState } from 'react';
import { ChangeLessonModal, type ChangeLessonFormData } from 'features.lesson.change';
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

function mapEventToChangeLesson(event: ICalendarEvent) {
  const subject = event.lessonInfo?.subject ?? event.title;
  const participantName = event.lessonInfo?.studentName ?? event.title;
  const participantId = event.lessonInfo?.teacherId;
  const defaultTitle = event.title;
  const defaultDescription = event.lessonInfo?.description ?? '';
  return { subject, participantName, participantId, defaultTitle, defaultDescription };
}

export type UseLessonInfoModalOptions = {
  onStartLesson?: (event: ICalendarEvent) => void;
  onReschedule?: (event: ICalendarEvent) => void;
  onCancelLesson?: (event: ICalendarEvent) => void;
  onSaveLesson?: (event: ICalendarEvent, data: ChangeLessonFormData) => void;
};

/**
 * Одна модалка «Информация о занятии» на выбранное событие — для канбана и мобильного списка.
 * Передайте `onReschedule` (например из `features.lesson.move`), чтобы открыть перенос занятия.
 */
export const useLessonInfoModal = ({
  onStartLesson,
  onReschedule,
  onCancelLesson,
  onSaveLesson,
}: UseLessonInfoModalOptions = {}) => {
  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const close = useCallback(() => {
    setSelectedEvent(null);
    setIsEditing(false);
  }, []);

  const lessonInfoModal =
    selectedEvent != null ? (
      <>
        {!isEditing ? (
          <LessonInfoModal
            open
            onOpenChange={(o) => {
              if (!o) close();
            }}
            {...mapEventToLessonInfo(selectedEvent)}
            onStartLesson={() => onStartLesson?.(selectedEvent)}
            onReschedule={() => onReschedule?.(selectedEvent)}
            onEditLesson={() => setIsEditing(true)}
            onCancelLesson={() => onCancelLesson?.(selectedEvent)}
          />
        ) : null}
        {isEditing ? (
          <ChangeLessonModal
            open
            onOpenChange={(o) => {
              if (!o) setIsEditing(false);
            }}
            {...mapEventToChangeLesson(selectedEvent)}
            onSave={(data) => onSaveLesson?.(selectedEvent, data)}
          />
        ) : null}
      </>
    ) : null;

  return {
    openLessonInfo: setSelectedEvent,
    closeLessonInfo: close,
    lessonInfoModal,
  };
};
