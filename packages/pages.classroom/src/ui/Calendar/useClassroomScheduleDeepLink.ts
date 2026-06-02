import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import type { DetailedEventInstanceDto } from 'common.api';
import {
  useCurrentUser,
  useStudentEventInstanceDetails,
  useTutorEventInstanceDetails,
} from 'common.services';

import { useClassroomScheduleSearch } from './useClassroomScheduleSearch';

function readInstanceStartsAt(details: DetailedEventInstanceDto | undefined): Date | undefined {
  if (!details || !('starts_at' in details) || typeof details.starts_at !== 'string')
    return undefined;
  const d = new Date(details.starts_at);
  return Number.isFinite(d.getTime()) ? d : undefined;
}

export function parseScheduleAnchorFromSearch(search: {
  focused_at?: string;
  event_instance_id?: string;
}): Date | null {
  const focusedAt =
    typeof search.focused_at === 'string' && search.focused_at.trim().length > 0
      ? search.focused_at.trim()
      : null;
  if (!focusedAt) return null;

  const d = new Date(focusedAt);
  return Number.isFinite(d.getTime()) ? d : null;
}

type UseClassroomScheduleDeepLinkOptions = {
  goToWeekStart: (date: Date) => void;
};

/**
 * Обработка `focused_at` и `event_instance_id` для вкладки «Расписание» кабинета.
 */
export function useClassroomScheduleDeepLink({
  goToWeekStart,
}: UseClassroomScheduleDeepLinkOptions) {
  const navigate = useNavigate();
  const { classroomId: classroomIdParam } = useParams({
    from: '/(app)/_layout/classrooms/$classroomId/',
  });

  const search = useClassroomScheduleSearch();

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const layoutReady = !isUserLoading && user != null;
  const isTutorUser = user?.default_layout === 'tutor';

  const classroomId = Number(classroomIdParam);
  const isScheduleTab = (search.tab ?? 'overview') === 'schedule';

  const focusedAtRaw = search.focused_at;
  const urlEventInstanceId = search.event_instance_id;

  const deeplinkInstanceIdRef = useRef<string | null>(null);
  const deeplinkFocusedAtRef = useRef<string | null>(null);

  if (urlEventInstanceId != null) {
    deeplinkInstanceIdRef.current = urlEventInstanceId;
  }
  if (focusedAtRaw != null) {
    deeplinkFocusedAtRef.current = focusedAtRaw;
  }

  const activeEventInstanceId = urlEventInstanceId ?? deeplinkInstanceIdRef.current;
  const activeFocusedAt = focusedAtRaw ?? deeplinkFocusedAtRef.current;

  const hasScheduleDeeplink = activeFocusedAt != null || activeEventInstanceId != null;

  const [pendingOpenLessonInstanceId, setPendingOpenLessonInstanceId] = useState<string | null>(
    null,
  );
  const [mobileScheduleAnchorTs, setMobileScheduleAnchorTs] = useState<number | null>(null);

  const lastFocusedAtRef = useRef<string | null>(null);
  const lastInstanceFocusRef = useRef<string | null>(null);
  const stripScheduledRef = useRef(false);

  const resetDeepLinkState = useCallback(() => {
    setPendingOpenLessonInstanceId(null);
    setMobileScheduleAnchorTs(null);
    deeplinkInstanceIdRef.current = null;
    deeplinkFocusedAtRef.current = null;
    lastFocusedAtRef.current = null;
    lastInstanceFocusRef.current = null;
    stripScheduledRef.current = false;
  }, []);

  const acknowledgePendingLessonOpen = useCallback(() => {
    setPendingOpenLessonInstanceId(null);
    deeplinkInstanceIdRef.current = null;
    lastInstanceFocusRef.current = null;
    stripScheduledRef.current = false;
  }, []);

  const prevClassroomIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevClassroomIdRef.current === null) {
      prevClassroomIdRef.current = classroomId;
      return;
    }
    if (prevClassroomIdRef.current !== classroomId) {
      prevClassroomIdRef.current = classroomId;
      resetDeepLinkState();
    }
  }, [classroomId, resetDeepLinkState]);

  useEffect(() => {
    if (urlEventInstanceId == null) return;
    setPendingOpenLessonInstanceId(null);
    lastInstanceFocusRef.current = null;
    stripScheduledRef.current = false;
  }, [urlEventInstanceId]);

  const stripDeeplinkParams = useCallback(() => {
    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: classroomIdParam },
      search: (prev: Record<string, unknown>) => {
        const next: Record<string, unknown> = { ...prev };
        delete next.event_instance_id;
        delete next.focused_at;
        return next;
      },
      replace: true,
    });
  }, [navigate, classroomIdParam]);

  const scheduleStripAfterCommit = useCallback(() => {
    if (stripScheduledRef.current) return;
    stripScheduledRef.current = true;
    queueMicrotask(() => {
      stripDeeplinkParams();
    });
  }, [stripDeeplinkParams]);

  const focusScheduleAtDate = useCallback(
    (d: Date) => {
      // Сдвигаем неделю расписания на дату события; запрос расписания
      // (Calendar) опирается на visibleDays и подхватит новую неделю.
      goToWeekStart(d);
      setMobileScheduleAnchorTs(d.getTime());
    },
    [goToWeekStart],
  );

  // Гарантируем вкладку «Расписание», если в URL есть диплинк
  useEffect(() => {
    if (!hasScheduleDeeplink || isScheduleTab) return;

    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: classroomIdParam },
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        tab: 'schedule',
      }),
    });
  }, [hasScheduleDeeplink, isScheduleTab, navigate, classroomIdParam]);

  // focused_at — переключаем неделю синхронно до отрисовки
  useLayoutEffect(() => {
    if (!hasScheduleDeeplink || !activeFocusedAt || activeEventInstanceId) return;
    if (lastFocusedAtRef.current === activeFocusedAt) return;

    const d = new Date(activeFocusedAt);
    if (!Number.isFinite(d.getTime())) {
      scheduleStripAfterCommit();
      return;
    }

    lastFocusedAtRef.current = activeFocusedAt;
    focusScheduleAtDate(d);
    scheduleStripAfterCommit();
  }, [
    hasScheduleDeeplink,
    activeFocusedAt,
    activeEventInstanceId,
    focusScheduleAtDate,
    scheduleStripAfterCommit,
  ]);

  const tutorDetails = useTutorEventInstanceDetails({
    classroomId,
    eventInstanceId: activeEventInstanceId ?? '',
    enabled: activeEventInstanceId != null && classroomId > 0 && layoutReady && isTutorUser,
  });

  const studentDetails = useStudentEventInstanceDetails({
    classroomId,
    eventInstanceId: activeEventInstanceId ?? '',
    enabled: activeEventInstanceId != null && classroomId > 0 && layoutReady && !isTutorUser,
  });

  const instanceDetailsQuery = isTutorUser ? tutorDetails : studentDetails;
  const instanceDetailsLoaded = instanceDetailsQuery.isSuccess;
  const instanceDetailsErrored = instanceDetailsQuery.isError;
  const instanceDetailsData = instanceDetailsQuery.data;

  useLayoutEffect(() => {
    if (activeEventInstanceId == null || !layoutReady) return;
    if (!instanceDetailsLoaded && !instanceDetailsErrored) return;

    const focusKey = `${activeEventInstanceId}:${instanceDetailsLoaded ? 'ok' : 'err'}`;
    if (lastInstanceFocusRef.current === focusKey) return;
    lastInstanceFocusRef.current = focusKey;

    if (instanceDetailsLoaded && instanceDetailsData != null) {
      const startAt = readInstanceStartsAt(instanceDetailsData);
      if (startAt != null) focusScheduleAtDate(startAt);
      // Неделя сфокусирована по starts_at — карточку откроет грид расписания,
      // как только инстанс появится в загруженных событиях (см. openLessonInstanceId).
      setPendingOpenLessonInstanceId(activeEventInstanceId);
      scheduleStripAfterCommit();
      return;
    }

    setPendingOpenLessonInstanceId(null);
    scheduleStripAfterCommit();
  }, [
    activeEventInstanceId,
    layoutReady,
    instanceDetailsLoaded,
    instanceDetailsErrored,
    instanceDetailsData,
    focusScheduleAtDate,
    scheduleStripAfterCommit,
  ]);

  return {
    pendingOpenLessonInstanceId,
    acknowledgePendingLessonOpen,
    mobileScheduleAnchorTs,
  };
}
