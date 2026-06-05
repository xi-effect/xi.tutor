import { useCallback, useEffect, useRef, useState } from 'react';
import { startOfDay } from 'date-fns';
import { useNavigate, useParams } from '@tanstack/react-router';
import type { ICalendarEvent } from 'modules.calendar';
import {
  readInstanceStartsAt,
  useCurrentUser,
  useStudentEventInstanceDetails,
  useTutorEventInstanceDetails,
} from 'common.services';

import { useClassroomScheduleSearch } from './useClassroomScheduleSearch';
import { mapInstanceDetailsToCalendarEvent } from './schedulerMapping';

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

/**
 * Диплинк расписания кабинета.
 *
 * Возвращает:
 * - `pendingEventToOpen` — событие, которое надо открыть в модалке (из GET details)
 * - `pendingAnchorDate` — дата для переключения недели календаря
 * - `acknowledgePendingLessonOpen` — вызвать после открытия модалки
 * - `mobileScheduleAnchorTs` — дата для синхронизации мобильного свайпера
 */
export function useClassroomScheduleDeepLink() {
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
  const scheduleDlToken = search.schedule_dl;

  // Сохраняем параметры в рефах — они переживают очистку URL
  const instanceIdRef = useRef<string | null>(null);
  const focusedAtRef = useRef<string | null>(null);

  if (urlEventInstanceId != null) instanceIdRef.current = urlEventInstanceId;
  if (focusedAtRaw != null) focusedAtRef.current = focusedAtRaw;

  const activeInstanceId = urlEventInstanceId ?? instanceIdRef.current;
  const activeFocusedAt = focusedAtRaw ?? focusedAtRef.current;
  const hasDeeplink = activeInstanceId != null || activeFocusedAt != null;

  const [pendingEventToOpen, setPendingEventToOpen] = useState<ICalendarEvent | null>(null);
  const [pendingAnchorDate, setPendingAnchorDate] = useState<Date | null>(null);
  const [pendingAnchorToken, setPendingAnchorToken] = useState(0);
  const [mobileScheduleAnchorTs, setMobileScheduleAnchorTs] = useState<number | null>(null);

  const processedRef = useRef<string | null>(null);
  const stripScheduledRef = useRef(false);
  const prevClassroomIdRef = useRef<number | null>(null);
  const lastScheduleDlRef = useRef<string | null>(null);

  // Новый клик по уведомлению (в т.ч. повторный на той же странице расписания)
  useEffect(() => {
    if (scheduleDlToken == null) return;
    if (lastScheduleDlRef.current === scheduleDlToken) return;
    lastScheduleDlRef.current = scheduleDlToken;
    processedRef.current = null;
    stripScheduledRef.current = false;
  }, [scheduleDlToken]);

  const stripParams = useCallback(() => {
    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: classroomIdParam },
      search: (prev: Record<string, unknown>) => {
        const next = { ...prev };
        delete next.event_instance_id;
        delete next.focused_at;
        delete next.schedule_dl;
        return next;
      },
      replace: true,
    });
  }, [navigate, classroomIdParam]);

  const scheduleStrip = useCallback(() => {
    if (stripScheduledRef.current) return;
    stripScheduledRef.current = true;
    stripParams();
  }, [stripParams]);

  const resetAll = useCallback(() => {
    setPendingEventToOpen(null);
    setPendingAnchorDate(null);
    setMobileScheduleAnchorTs(null);
    instanceIdRef.current = null;
    focusedAtRef.current = null;
    processedRef.current = null;
    stripScheduledRef.current = false;
  }, []);

  /** После открытия модалки — не трогаем pendingAnchorDate (его обрабатывает Calendar). */
  const acknowledgeEventOpen = useCallback(() => {
    if (!stripScheduledRef.current) {
      stripScheduledRef.current = true;
      stripParams();
    }
    setPendingEventToOpen(null);
    instanceIdRef.current = null;
    processedRef.current = null;
    stripScheduledRef.current = false;
  }, [stripParams]);

  const acknowledgeAnchorNavigation = useCallback(() => {
    setPendingAnchorDate(null);
    focusedAtRef.current = null;
  }, []);

  // Сброс при смене кабинета
  useEffect(() => {
    if (prevClassroomIdRef.current !== null && prevClassroomIdRef.current !== classroomId) {
      resetAll();
    }
    prevClassroomIdRef.current = classroomId;
  }, [classroomId, resetAll]);

  // Переключаем на вкладку расписания
  useEffect(() => {
    if (!hasDeeplink || isScheduleTab) return;
    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: classroomIdParam },
      search: (prev: Record<string, unknown>) => ({ ...prev, tab: 'schedule' }),
    });
  }, [hasDeeplink, isScheduleTab, navigate, classroomIdParam]);

  // focused_at: только переключение недели, без модалки
  const lastFocusedAtRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeFocusedAt || activeInstanceId) return;
    if (lastFocusedAtRef.current === activeFocusedAt) return;

    const d = new Date(activeFocusedAt);
    if (!Number.isFinite(d.getTime())) {
      scheduleStrip();
      return;
    }

    lastFocusedAtRef.current = activeFocusedAt;
    setPendingAnchorDate(d);
    setMobileScheduleAnchorTs(d.getTime());
    setPendingAnchorToken((t) => t + 1);
    scheduleStrip();
  }, [activeFocusedAt, activeInstanceId, scheduleStrip]);

  // event_instance_id: грузим детали и открываем модалку
  const tutorDetails = useTutorEventInstanceDetails({
    classroomId,
    eventInstanceId: activeInstanceId ?? '',
    enabled: activeInstanceId != null && classroomId > 0 && layoutReady && isTutorUser === true,
  });

  const studentDetails = useStudentEventInstanceDetails({
    classroomId,
    eventInstanceId: activeInstanceId ?? '',
    enabled: activeInstanceId != null && classroomId > 0 && layoutReady && isTutorUser === false,
  });

  const detailsQuery = isTutorUser ? tutorDetails : studentDetails;

  useEffect(() => {
    const instanceId = urlEventInstanceId;
    if (instanceId == null || !layoutReady) return;
    if (processedRef.current === instanceId) return;
    if (detailsQuery.isPending || detailsQuery.isFetching) return;

    if (detailsQuery.isSuccess && detailsQuery.data != null) {
      const event = mapInstanceDetailsToCalendarEvent(detailsQuery.data, classroomId);
      const startAt = readInstanceStartsAt(detailsQuery.data) ?? startOfDay(new Date(event.start));

      setPendingEventToOpen(event);

      if (Number.isFinite(startAt.getTime())) {
        setPendingAnchorDate(startAt);
        setMobileScheduleAnchorTs(startAt.getTime());
        setPendingAnchorToken((t) => t + 1);
      }

      processedRef.current = instanceId;
      // URL стрипается в acknowledge(), когда модалка уже открыта
    } else if (detailsQuery.isError) {
      processedRef.current = instanceId;
      scheduleStrip();
    }
  }, [
    urlEventInstanceId,
    scheduleDlToken,
    layoutReady,
    classroomId,
    detailsQuery.isPending,
    detailsQuery.isFetching,
    detailsQuery.isSuccess,
    detailsQuery.isError,
    detailsQuery.data,
    scheduleStrip,
  ]);

  return {
    pendingEventToOpen,
    pendingAnchorDate,
    pendingAnchorToken,
    acknowledgePendingLessonOpen: acknowledgeEventOpen,
    acknowledgeAnchorNavigation,
    mobileScheduleAnchorTs,
  };
}
