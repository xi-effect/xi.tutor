import { useCallback, useEffect, useState } from 'react';
import type { ChangeLessonFormData } from 'features.lesson.change';
import { CancelLessonModal, type CancelLessonVariant } from 'features.lesson.cancel';
import { LessonInfoModal } from 'features.lesson.info';
import { useCurrentUser, useGetClassroom, useGetClassroomStudent } from 'common.services';
import type { ICalendarEvent, LessonCancelScope } from '../ui/types';
import { timeToString } from '../utils';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const SCHEDULE_TOOLTIP = 'Кнопка станет активной за 5 минут до начала занятия';

function isWithinStartWindow(start: Date): boolean {
  return start.getTime() - Date.now() <= FIVE_MINUTES_MS;
}

function cancelVariantFromEvent(event: ICalendarEvent): CancelLessonVariant {
  const kind = event.scheduler?.instanceKind;
  return kind == null || kind === 'sole' ? 'sole' : 'recurring';
}

function mapEventToLessonInfo(event: ICalendarEvent) {
  const startTime = event.isAllDay ? null : timeToString(new Date(event.start));
  const endTime = event.isAllDay ? null : timeToString(new Date(event.end));
  const lessonTitle = event.title;
  const rawSubject = event.lessonInfo?.subject ?? '';
  const subject =
    rawSubject.trim() !== lessonTitle.trim() && rawSubject.trim().length > 0
      ? rawSubject.trim()
      : '';
  const desc = event.lessonInfo?.description?.trim();
  const lessonDescription = desc != null && desc.length > 0 ? desc : undefined;
  return { subject, lessonTitle, lessonDescription, startTime, endTime };
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
  /** Отмена: одиночное занятие / одно из серии / вся серия — см. {@link LessonCancelScope} */
  onCancelLesson?: (event: ICalendarEvent, scope: LessonCancelScope) => void;
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
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const classroomId = selectedEvent?.lessonInfo?.classroomId;
  const tutorClassroomQuery = useGetClassroom(classroomId ?? 0, !isTutor || classroomId == null);
  const studentClassroomQuery = useGetClassroomStudent(
    classroomId ?? 0,
    isTutor || classroomId == null,
  );

  const classroomQuery = isTutor ? tutorClassroomQuery : studentClassroomQuery;

  const [canStartNow, setCanStartNow] = useState(() =>
    selectedEvent ? isWithinStartWindow(new Date(selectedEvent.start)) : true,
  );

  useEffect(() => {
    if (!selectedEvent) return;
    const startDate = new Date(selectedEvent.start);
    if (isWithinStartWindow(startDate)) {
      setCanStartNow(true);
      return;
    }
    setCanStartNow(false);
    const msUntilWindow = startDate.getTime() - Date.now() - FIVE_MINUTES_MS;
    if (msUntilWindow <= 0) {
      setCanStartNow(true);
      return;
    }
    const timer = setTimeout(() => setCanStartNow(true), msUntilWindow);
    return () => clearTimeout(timer);
  }, [selectedEvent]);

  useEffect(() => {
    if (!selectedEvent) {
      setCancelModalOpen(false);
    }
  }, [selectedEvent]);

  const isStartLessonDisabled = isTutor && !canStartNow;
  const startLessonTooltip = isStartLessonDisabled ? SCHEDULE_TOOLTIP : undefined;

  const handleStartLesson = (event: ICalendarEvent) => {
    if (onStartLesson) {
      onStartLesson(event);
      return;
    }
    const cid = event.lessonInfo?.classroomId;
    if (cid != null) {
      window.location.href = `/classrooms/${cid}?goto=call`;
    }
  };

  const close = useCallback(() => {
    setSelectedEvent(null);
    setCancelModalOpen(false);
  }, []);

  const emitCancel = useCallback(
    (scope: LessonCancelScope) => {
      if (selectedEvent == null || !onCancelLesson) return;
      onCancelLesson(selectedEvent, scope);
      setCancelModalOpen(false);
      close();
    },
    [close, onCancelLesson, selectedEvent],
  );

  const showCancelFlow = Boolean(onCancelLesson);

  const lessonInfoModal =
    selectedEvent != null ? (
      <>
        <LessonInfoModal
          open
          onOpenChange={(o) => {
            if (!o) close();
          }}
          {...mapEventToLessonInfo(selectedEvent)}
          classroomId={classroomId}
          classroom={classroomQuery.data}
          classroomLoading={classroomId != null && classroomQuery.isLoading}
          onStartLesson={() => handleStartLesson(selectedEvent)}
          isStartLessonDisabled={isStartLessonDisabled}
          startLessonTooltip={startLessonTooltip}
          onReschedule={() => onReschedule?.(selectedEvent)}
          changeLesson={
            onSaveLesson != null
              ? {
                  ...mapEventToChangeLesson(selectedEvent),
                  onSave: (data) => onSaveLesson(selectedEvent, data),
                }
              : undefined
          }
          onCancelClick={showCancelFlow ? () => setCancelModalOpen(true) : undefined}
        />
        {showCancelFlow ? (
          <CancelLessonModal
            open={cancelModalOpen}
            onOpenChange={setCancelModalOpen}
            variant={cancelVariantFromEvent(selectedEvent)}
            onCancelOne={() => emitCancel('this_occurrence')}
            onCancelAll={() => emitCancel('whole_series')}
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
