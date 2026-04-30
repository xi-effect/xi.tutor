import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeLessonFormData } from 'features.lesson.change';
import { CancelLessonModal } from 'features.lesson.cancel';
import { LessonInfoModal } from 'features.lesson.info';
import {
  useCurrentUser,
  useGetClassroom,
  useGetClassroomStudent,
  useTutorEventInstanceDetails,
  useStudentEventInstanceDetails,
} from 'common.services';
import type { ICalendarEvent } from '../ui/types';
import { timeToString } from '../utils';
import { useCalendarEvents } from '../store/eventsStore';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const SCHEDULE_TOOLTIP = 'Кнопка станет активной за 5 минут до начала занятия';

function isWithinStartWindow(start: Date): boolean {
  return start.getTime() - Date.now() <= FIVE_MINUTES_MS;
}

function mapEventToLessonInfo(
  event: ICalendarEvent,
  instanceDetails?: {
    name: string;
    description: string | null;
    starts_at: string;
    ends_at: string;
  },
) {
  const startTime = event.isAllDay
    ? null
    : instanceDetails
      ? timeToString(new Date(instanceDetails.starts_at))
      : timeToString(new Date(event.start));
  const endTime = event.isAllDay
    ? null
    : instanceDetails
      ? timeToString(new Date(instanceDetails.ends_at))
      : timeToString(new Date(event.end));
  const lessonTitle = instanceDetails?.name ?? event.title;
  const rawSubject = event.lessonInfo?.subject ?? '';
  const subject =
    rawSubject.trim() !== lessonTitle.trim() && rawSubject.trim().length > 0
      ? rawSubject.trim()
      : '';
  const rawDesc = instanceDetails?.description ?? event.lessonInfo?.description;
  const desc = rawDesc?.trim();
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
  onSaveLesson?: (event: ICalendarEvent, data: ChangeLessonFormData) => void;
};

/**
 * Одна модалка «Информация о занятии» на выбранное событие — для канбана и мобильного списка.
 * Передайте `onReschedule` (например из `features.lesson.move`), чтобы открыть перенос занятия.
 */
export const useLessonInfoModal = ({
  onStartLesson,
  onReschedule,
  onSaveLesson,
}: UseLessonInfoModalOptions = {}) => {
  const events = useCalendarEvents();
  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  /** Актуальная версия события из стора после рефетча расписания (PATCH и т.д.) */
  const resolvedEvent = useMemo(() => {
    if (selectedEvent == null) return null;
    return events.find((e) => e.id === selectedEvent.id) ?? selectedEvent;
  }, [events, selectedEvent]);

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const classroomId = resolvedEvent?.lessonInfo?.classroomId;
  const tutorClassroomQuery = useGetClassroom(classroomId ?? 0, !isTutor || classroomId == null);
  const studentClassroomQuery = useGetClassroomStudent(
    classroomId ?? 0,
    isTutor || classroomId == null,
  );

  const classroomQuery = isTutor ? tutorClassroomQuery : studentClassroomQuery;

  const eventInstanceId = resolvedEvent?.scheduler?.eventInstanceId ?? '';
  const canFetchInstanceDetails =
    classroomId != null && eventInstanceId.length > 0 && resolvedEvent != null;

  const tutorInstanceDetailsQuery = useTutorEventInstanceDetails({
    classroomId: classroomId ?? 0,
    eventInstanceId,
    enabled: isTutor && canFetchInstanceDetails,
  });

  const studentInstanceDetailsQuery = useStudentEventInstanceDetails({
    classroomId: classroomId ?? 0,
    eventInstanceId,
    enabled: !isTutor && canFetchInstanceDetails,
  });

  const instanceDetails = isTutor
    ? tutorInstanceDetailsQuery.data
    : studentInstanceDetailsQuery.data;

  const [canStartNow, setCanStartNow] = useState(() =>
    resolvedEvent ? isWithinStartWindow(new Date(resolvedEvent.start)) : true,
  );

  useEffect(() => {
    if (!resolvedEvent) return;
    const startDate = new Date(resolvedEvent.start);
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
  }, [resolvedEvent]);

  useEffect(() => {
    if (!resolvedEvent) {
      setCancelModalOpen(false);
    }
  }, [resolvedEvent]);

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

  const showCancelFlow =
    isTutor &&
    classroomId != null &&
    resolvedEvent?.scheduler != null &&
    resolvedEvent.isCancelled !== true;

  const schedulerMetaForCancel =
    resolvedEvent?.scheduler != null
      ? {
          eventId: resolvedEvent.scheduler.eventId,
          instanceKind: resolvedEvent.scheduler.instanceKind,
          eventInstanceId: resolvedEvent.scheduler.eventInstanceId,
          repetitionModeId: resolvedEvent.scheduler.repetitionModeId,
          instanceIndex: resolvedEvent.scheduler.instanceIndex,
        }
      : null;

  const lessonInfoModal =
    resolvedEvent != null ? (
      <>
        <LessonInfoModal
          open
          onOpenChange={(o) => {
            if (!o) close();
          }}
          {...mapEventToLessonInfo(resolvedEvent, instanceDetails)}
          classroomId={classroomId}
          classroom={classroomQuery.data}
          classroomLoading={classroomId != null && classroomQuery.isLoading}
          onStartLesson={() => handleStartLesson(resolvedEvent)}
          isStartLessonDisabled={isStartLessonDisabled}
          startLessonTooltip={startLessonTooltip}
          onReschedule={() => onReschedule?.(resolvedEvent)}
          changeLesson={
            onSaveLesson != null
              ? {
                  ...mapEventToChangeLesson(resolvedEvent),
                  onSave: (data) => onSaveLesson(resolvedEvent, data),
                }
              : undefined
          }
          onCancelClick={showCancelFlow ? () => setCancelModalOpen(true) : undefined}
        />
        {showCancelFlow ? (
          <CancelLessonModal
            open={cancelModalOpen}
            onOpenChange={setCancelModalOpen}
            classroomId={classroomId}
            schedulerMeta={schedulerMetaForCancel}
            onSuccess={close}
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
