import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeLessonFormData } from 'features.lesson.change';
import { CancelLessonModal } from 'features.lesson.cancel';
import { LessonInfoModal } from 'features.lesson.info';
import {
  useCurrentUser,
  useGetClassroom,
  useGetClassroomStudent,
  useStudentEventInstanceDetails,
  useStudentRepeatedEventInstanceDetails,
  useTutorEventInstanceDetails,
  useTutorRepeatedEventInstanceDetails,
} from 'common.services';
import type { ICalendarEvent } from '../ui/types';
import { timeToString } from '../utils';
import { useCalendarEvents } from '../store/eventsStore';
import { useLessonClassroomPresentation } from './useLessonClassroomPresentation';
import { StartLessonButton } from 'features.lesson.start';

function safeTimeToString(primary: string | undefined | null, fallback: Date): string {
  if (primary != null && primary.length > 0) {
    const d = new Date(primary);
    if (!isNaN(d.getTime())) return timeToString(d);
  }
  return timeToString(new Date(fallback));
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
    : safeTimeToString(instanceDetails?.starts_at, event.start);
  const endTime = event.isAllDay ? null : safeTimeToString(instanceDetails?.ends_at, event.end);
  const lessonTitle = instanceDetails?.name ?? event.title;
  const rawSubject = event.lessonInfo?.subject ?? '';
  const rawSubjectTrimmed = rawSubject.trim();
  /** Отдельная строка предмета из события — только если не дублирует название занятия (имя слота ≠ учебный предмет). */
  const subject =
    rawSubjectTrimmed.length > 0 && rawSubjectTrimmed !== lessonTitle.trim()
      ? rawSubjectTrimmed
      : '';
  const rawDesc = instanceDetails?.description ?? event.lessonInfo?.description;
  const desc = rawDesc?.trim();
  const lessonDescription = desc != null && desc.length > 0 ? desc : undefined;
  return { subject, lessonTitle, lessonDescription, startTime, endTime };
}

export type UseLessonInfoModalOptions = {
  onReschedule?: (event: ICalendarEvent) => void;
  onSaveLesson?: (event: ICalendarEvent, data: ChangeLessonFormData) => void;
};

/**
 * Одна модалка «Информация о занятии» на выбранное событие — для канбана и мобильного списка.
 * Передайте `onReschedule` (например из `features.lesson.move`), чтобы открыть перенос занятия.
 */
export const useLessonInfoModal = ({
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

  const repetitionModeId = resolvedEvent?.scheduler?.repetitionModeId ?? '';
  const repeatedInstanceIndex = resolvedEvent?.scheduler?.instanceIndex;
  const isRepeatedVirtual = resolvedEvent?.scheduler?.instanceKind === 'repeated_virtual';
  const canFetchRepeatedInstanceDetails =
    classroomId != null &&
    repetitionModeId.length > 0 &&
    typeof repeatedInstanceIndex === 'number' &&
    Number.isInteger(repeatedInstanceIndex) &&
    repeatedInstanceIndex >= 0;

  const tutorRepeatedInstanceDetailsQuery = useTutorRepeatedEventInstanceDetails({
    classroomId: classroomId ?? 0,
    repetitionModeId,
    instanceIndex: typeof repeatedInstanceIndex === 'number' ? repeatedInstanceIndex : -1,
    enabled: isTutor && isRepeatedVirtual && canFetchRepeatedInstanceDetails,
  });

  const studentRepeatedInstanceDetailsQuery = useStudentRepeatedEventInstanceDetails({
    classroomId: classroomId ?? 0,
    repetitionModeId,
    instanceIndex: typeof repeatedInstanceIndex === 'number' ? repeatedInstanceIndex : -1,
    enabled: !isTutor && isRepeatedVirtual && canFetchRepeatedInstanceDetails,
  });

  const repeatedInstanceDetailsQuery = isTutor
    ? tutorRepeatedInstanceDetailsQuery
    : studentRepeatedInstanceDetailsQuery;

  const scheduleTimesLoading =
    isTutor &&
    isRepeatedVirtual &&
    canFetchRepeatedInstanceDetails &&
    repeatedInstanceDetailsQuery.isPending;

  const instanceDetails = isTutor
    ? isRepeatedVirtual
      ? tutorRepeatedInstanceDetailsQuery.data
      : tutorInstanceDetailsQuery.data
    : isRepeatedVirtual
      ? studentRepeatedInstanceDetailsQuery.data
      : studentInstanceDetailsQuery.data;

  const resolvedScheduleAt = useMemo(() => {
    const raw = instanceDetails?.starts_at;
    if (raw != null && raw.length > 0) {
      const d = new Date(raw);
      if (Number.isFinite(d.getTime())) return d;
    }
    return resolvedEvent?.start;
  }, [instanceDetails?.starts_at, resolvedEvent?.start]);

  const resolvedScheduleEndsAt = useMemo(() => {
    const raw = instanceDetails?.ends_at;
    if (raw != null && raw.length > 0) {
      const d = new Date(raw);
      if (Number.isFinite(d.getTime())) return d;
    }
    return resolvedEvent?.end;
  }, [instanceDetails?.ends_at, resolvedEvent?.end]);

  const changeLessonPresentation = useLessonClassroomPresentation({
    classroomId: resolvedEvent?.lessonInfo?.classroomId,
    fallbackClassroomName: resolvedEvent?.lessonInfo?.studentName ?? resolvedEvent?.title ?? '',
    fallbackAvatarUserId: resolvedEvent?.lessonInfo?.teacherId,
    enabled: resolvedEvent != null,
  });

  useEffect(() => {
    if (!resolvedEvent) {
      setCancelModalOpen(false);
    }
  }, [resolvedEvent]);

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
          presentationSubjectName={changeLessonPresentation.subjectName}
          classroomId={classroomId}
          classroom={classroomQuery.data}
          classroomLoading={classroomId != null && classroomQuery.isLoading}
          startLessonSlot={
            classroomId != null ? (
              <StartLessonButton
                classroomId={classroomId}
                scheduledAt={resolvedScheduleAt}
                scheduledEndsAt={resolvedScheduleEndsAt}
                scheduleTimesLoading={scheduleTimesLoading}
                className="text-brand-100 bg-brand-0 hover:bg-brand-20/50 h-12 min-h-12"
              />
            ) : undefined
          }
          onReschedule={() => onReschedule?.(resolvedEvent)}
          changeLesson={
            isTutor && resolvedEvent != null
              ? {
                  hideClassroomAndSubject: false,
                  subjectName: changeLessonPresentation.subjectName,
                  classroomName: changeLessonPresentation.classroomName,
                  classroomLineUserId:
                    changeLessonPresentation.avatarUserId ??
                    resolvedEvent.lessonInfo?.teacherId ??
                    0,
                  defaultTitle: resolvedEvent.title,
                  defaultDescription: resolvedEvent.lessonInfo?.description ?? '',
                  onSave: (data) => onSaveLesson?.(resolvedEvent, data),
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
