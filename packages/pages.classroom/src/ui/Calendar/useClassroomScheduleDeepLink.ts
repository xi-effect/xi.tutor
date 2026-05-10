import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import {
  type DetailedEventInstanceDto,
  useCurrentUser,
  useStudentEventInstanceDetails,
  useTutorEventInstanceDetails,
} from 'common.services';

import { useClassroomSchedule } from './ClassroomScheduleContext';

function readInstanceStartsAt(details: DetailedEventInstanceDto | undefined): Date | undefined {
  if (!details || !('starts_at' in details) || typeof details.starts_at !== 'string')
    return undefined;
  const d = new Date(details.starts_at);
  return Number.isFinite(d.getTime()) ? d : undefined;
}

/**
 * Обработка `focused_at` и `event_instance_id` для вкладки «Расписание» кабинета.
 * После перехода к дате (и перед открытием модалки) убирает эти параметры из URL.
 */
export function useClassroomScheduleDeepLink(opts: { enabled: boolean }) {
  const { enabled } = opts;
  const { goToWeekStart } = useClassroomSchedule();
  const navigate = useNavigate();
  const { classroomId: classroomIdParam } = useParams({
    from: '/(app)/_layout/classrooms/$classroomId/',
  });

  const search = useSearch({ strict: false }) as {
    tab?: string;
    call?: string;
    focused_at?: string;
    event_instance_id?: string;
  };

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const layoutReady = !isUserLoading && user != null;
  const isTutorUser = user?.default_layout === 'tutor';

  const classroomId = Number(classroomIdParam);

  const [pendingOpenLessonInstanceId, setPendingOpenLessonInstanceId] = useState<string | null>(
    null,
  );
  const [mobileScheduleAnchorTs, setMobileScheduleAnchorTs] = useState<number | null>(null);

  useEffect(() => {
    setPendingOpenLessonInstanceId(null);
    setMobileScheduleAnchorTs(null);
  }, [classroomId]);

  const focusedAtRaw =
    typeof search.focused_at === 'string' && search.focused_at.trim().length > 0
      ? search.focused_at.trim()
      : undefined;
  const urlEventInstanceId =
    typeof search.event_instance_id === 'string' && search.event_instance_id.trim().length > 0
      ? search.event_instance_id.trim()
      : undefined;

  const stripDeeplinkParams = useCallback(() => {
    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: classroomIdParam },
      search: (prev) => {
        const next = {
          ...(prev as typeof prev & { event_instance_id?: string; focused_at?: string }),
        };
        delete next.event_instance_id;
        delete next.focused_at;
        return next;
      },
      replace: true,
    });
  }, [navigate, classroomIdParam]);

  const focusScheduleAtDate = useCallback(
    (d: Date) => {
      goToWeekStart(d);
      setMobileScheduleAnchorTs(d.getTime());
    },
    [goToWeekStart],
  );

  // Только переход по дате (без event_instance — у того приоритет и своя цепочка)
  useEffect(() => {
    if (!enabled) return;
    if (!focusedAtRaw || urlEventInstanceId) return;

    const d = new Date(focusedAtRaw);
    if (!Number.isFinite(d.getTime())) {
      stripDeeplinkParams();
      return;
    }

    focusScheduleAtDate(d);
    stripDeeplinkParams();
  }, [enabled, focusedAtRaw, urlEventInstanceId, focusScheduleAtDate, stripDeeplinkParams]);

  const tutorDetails = useTutorEventInstanceDetails({
    classroomId,
    eventInstanceId: urlEventInstanceId ?? '',
    enabled:
      enabled &&
      urlEventInstanceId != null &&
      classroomId > 0 &&
      layoutReady &&
      isTutorUser === true,
  });

  const studentDetails = useStudentEventInstanceDetails({
    classroomId,
    eventInstanceId: urlEventInstanceId ?? '',
    enabled:
      enabled &&
      urlEventInstanceId != null &&
      classroomId > 0 &&
      layoutReady &&
      isTutorUser === false,
  });

  const instanceDetailsQuery = isTutorUser ? tutorDetails : studentDetails;
  const instanceDetailsLoaded = instanceDetailsQuery.isSuccess;
  const instanceDetailsErrored = instanceDetailsQuery.isError;
  const instanceDetailsData = instanceDetailsQuery.data;

  useEffect(() => {
    if (!enabled || urlEventInstanceId == null || !layoutReady) return;

    if (!instanceDetailsLoaded && !instanceDetailsErrored) return;

    stripDeeplinkParams();

    if (instanceDetailsLoaded) {
      const startAt = readInstanceStartsAt(instanceDetailsData);
      if (startAt != null) focusScheduleAtDate(startAt);
      setPendingOpenLessonInstanceId(urlEventInstanceId);
      return;
    }

    setPendingOpenLessonInstanceId(null);
  }, [
    enabled,
    urlEventInstanceId,
    layoutReady,
    instanceDetailsLoaded,
    instanceDetailsErrored,
    instanceDetailsData,
    focusScheduleAtDate,
    stripDeeplinkParams,
  ]);

  const acknowledgePendingLessonOpen = useCallback(() => {
    setPendingOpenLessonInstanceId(null);
  }, []);

  return {
    pendingOpenLessonInstanceId,
    acknowledgePendingLessonOpen,
    mobileScheduleAnchorTs,
  };
}
