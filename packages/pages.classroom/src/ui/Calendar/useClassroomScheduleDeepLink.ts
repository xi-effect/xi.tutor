import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { startOfDay } from 'date-fns';
import { useNavigate, useParams } from '@tanstack/react-router';
import type { ICalendarEvent } from 'modules.calendar';
import {
  getStudentEventInstanceDetails,
  getStudentRepeatedEventInstanceDetails,
  getTutorEventInstanceDetails,
  getTutorRepeatedEventInstanceDetails,
  readInstanceIsCancelled,
  readInstanceStartsAt,
  schedulerQueryKeys,
  useCurrentUser,
} from 'common.services';

import { useClassroomScheduleSearch } from './useClassroomScheduleSearch';
import { mapInstanceDetailsToCalendarEvent } from './schedulerMapping';

export function parseScheduleAnchorFromSearch(search: {
  focused_at?: string;
  event_instance_id?: string;
  repetition_mode_id?: string;
  instance_index?: string | number;
}): Date | null {
  const focusedAt =
    typeof search.focused_at === 'string' && search.focused_at.trim().length > 0
      ? search.focused_at.trim()
      : null;
  if (!focusedAt) return null;

  const d = startOfDay(new Date(focusedAt));
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
  const urlRepetitionModeId = search.repetition_mode_id;
  const urlInstanceIndexRaw = search.instance_index;
  const parsedInstanceIndex =
    urlInstanceIndexRaw != null && String(urlInstanceIndexRaw).trim().length > 0
      ? Number(urlInstanceIndexRaw)
      : null;
  const urlInstanceIndex =
    parsedInstanceIndex != null && Number.isFinite(parsedInstanceIndex)
      ? parsedInstanceIndex
      : null;
  const scheduleDlToken = search.schedule_dl;

  // Сохраняем параметры в рефах — они переживают очистку URL
  const instanceIdRef = useRef<string | null>(null);
  const focusedAtRef = useRef<string | null>(null);
  const repetitionModeIdRef = useRef<string | null>(null);
  const instanceIndexRef = useRef<number | null>(null);

  if (urlEventInstanceId != null) {
    instanceIdRef.current = urlEventInstanceId;
  } else if (focusedAtRaw != null || urlRepetitionModeId != null) {
    instanceIdRef.current = null;
  }
  if (focusedAtRaw != null) focusedAtRef.current = focusedAtRaw;
  if (urlRepetitionModeId != null) {
    repetitionModeIdRef.current = urlRepetitionModeId;
    instanceIdRef.current = null;
    focusedAtRef.current = null;
  }
  if (urlInstanceIndex != null) instanceIndexRef.current = urlInstanceIndex;

  const activeInstanceId =
    urlEventInstanceId ??
    (focusedAtRaw != null ||
    focusedAtRef.current != null ||
    urlRepetitionModeId != null ||
    repetitionModeIdRef.current != null
      ? null
      : instanceIdRef.current);
  const activeFocusedAt = focusedAtRaw ?? focusedAtRef.current;
  const activeRepetitionModeId = urlRepetitionModeId ?? repetitionModeIdRef.current;
  const activeInstanceIndex = urlInstanceIndex ?? instanceIndexRef.current;
  const hasRepeatedDeeplink = activeRepetitionModeId != null && activeInstanceIndex != null;
  const hasDeeplink = activeInstanceId != null || activeFocusedAt != null || hasRepeatedDeeplink;

  const [pendingEventToOpen, setPendingEventToOpen] = useState<ICalendarEvent | null>(null);
  const [pendingAnchorDate, setPendingAnchorDate] = useState<Date | null>(null);
  const [pendingAnchorToken, setPendingAnchorToken] = useState(0);
  const [mobileScheduleAnchorTs, setMobileScheduleAnchorTs] = useState<number | null>(null);

  const lastProcessedInstanceDeeplinkRef = useRef<string | null>(null);
  const lastProcessedRepeatedDeeplinkRef = useRef<string | null>(null);
  const lastFocusedAtRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const stripScheduledRef = useRef(false);
  const prevClassroomIdRef = useRef<number | null>(null);
  const lastScheduleDlRef = useRef<string | null>(null);

  // Новый клик по уведомлению (в т.ч. повторный на той же странице расписания)
  useEffect(() => {
    if (scheduleDlToken == null) return;
    if (lastScheduleDlRef.current === scheduleDlToken) return;
    lastScheduleDlRef.current = scheduleDlToken;
    lastProcessedInstanceDeeplinkRef.current = null;
    lastProcessedRepeatedDeeplinkRef.current = null;
    lastFocusedAtRef.current = null;
    instanceIdRef.current = null;
    repetitionModeIdRef.current = null;
    instanceIndexRef.current = null;
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
        delete next.repetition_mode_id;
        delete next.instance_index;
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
    repetitionModeIdRef.current = null;
    instanceIndexRef.current = null;
    lastProcessedInstanceDeeplinkRef.current = null;
    lastProcessedRepeatedDeeplinkRef.current = null;
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
    repetitionModeIdRef.current = null;
    instanceIndexRef.current = null;
    lastProcessedInstanceDeeplinkRef.current = null;
    lastProcessedRepeatedDeeplinkRef.current = null;
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

  // focused_at: только дата в расписании (layout — до paint; без event_instance_id / repeated в URL)
  useLayoutEffect(() => {
    if (urlEventInstanceId != null || activeInstanceId != null) return;
    if (urlRepetitionModeId != null || activeRepetitionModeId != null) return;

    const focusedAt = focusedAtRaw ?? focusedAtRef.current;
    if (!focusedAt) return;

    const dedupeKey = scheduleDlToken != null ? `dl:${scheduleDlToken}` : `at:${focusedAt}`;
    if (lastFocusedAtRef.current === dedupeKey) return;

    const d = startOfDay(new Date(focusedAt));
    if (!Number.isFinite(d.getTime())) {
      scheduleStrip();
      return;
    }

    lastFocusedAtRef.current = dedupeKey;
    focusedAtRef.current = focusedAt;
    setPendingEventToOpen(null);
    setPendingAnchorDate(d);
    setMobileScheduleAnchorTs(d.getTime());
    setPendingAnchorToken((t) => t + 1);
    scheduleStrip();
  }, [
    focusedAtRaw,
    urlEventInstanceId,
    activeInstanceId,
    urlRepetitionModeId,
    activeRepetitionModeId,
    scheduleDlToken,
    scheduleStrip,
  ]);

  // event_instance_id: свежие детали с API (без устаревшего кэша) → дата; модалка только если не отменено
  useEffect(() => {
    if (urlRepetitionModeId != null || repetitionModeIdRef.current != null) return;

    const instanceId = urlEventInstanceId ?? instanceIdRef.current;
    if (instanceId == null || !layoutReady || classroomId <= 0 || isTutorUser == null) return;

    const deeplinkKey = scheduleDlToken ?? `inst:${instanceId}`;
    if (lastProcessedInstanceDeeplinkRef.current === deeplinkKey) return;

    let aborted = false;

    void (async () => {
      const detailsKey = isTutorUser
        ? schedulerQueryKeys.tutorEventInstanceDetails(classroomId, instanceId)
        : schedulerQueryKeys.studentEventInstanceDetails(classroomId, instanceId);

      await queryClient.invalidateQueries({ queryKey: detailsKey });
      await queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.tutorAllForClassroom(classroomId),
      });
      await queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.studentAllForClassroom(classroomId),
      });
      await queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.tutorScheduleAll() });
      await queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.studentScheduleAll() });

      try {
        const data = await queryClient.fetchQuery({
          queryKey: detailsKey,
          queryFn: () =>
            isTutorUser
              ? getTutorEventInstanceDetails({ classroomId, eventInstanceId: instanceId })
              : getStudentEventInstanceDetails({ classroomId, eventInstanceId: instanceId }),
        });

        if (aborted) return;

        lastProcessedInstanceDeeplinkRef.current = deeplinkKey;

        const startAt = readInstanceStartsAt(data);
        const anchor =
          startAt != null && Number.isFinite(startAt.getTime()) ? startOfDay(startAt) : null;

        if (readInstanceIsCancelled(data)) {
          setPendingEventToOpen(null);
          if (anchor != null) {
            setPendingAnchorDate(anchor);
            setMobileScheduleAnchorTs(anchor.getTime());
            setPendingAnchorToken((t) => t + 1);
          }
          scheduleStrip();
          return;
        }

        const event = mapInstanceDetailsToCalendarEvent(data, classroomId);
        const fallbackStart = anchor ?? startOfDay(new Date(event.start));

        setPendingEventToOpen(event);
        if (Number.isFinite(fallbackStart.getTime())) {
          setPendingAnchorDate(fallbackStart);
          setMobileScheduleAnchorTs(fallbackStart.getTime());
          setPendingAnchorToken((t) => t + 1);
        }
      } catch {
        if (!aborted) {
          lastProcessedInstanceDeeplinkRef.current = deeplinkKey;
          scheduleStrip();
        }
      }
    })();

    return () => {
      aborted = true;
    };
  }, [
    urlEventInstanceId,
    urlRepetitionModeId,
    scheduleDlToken,
    layoutReady,
    classroomId,
    isTutorUser,
    queryClient,
    scheduleStrip,
  ]);

  // repetition_mode_id + instance_index: детали виртуального инстанса серии
  useEffect(() => {
    const repetitionModeId = urlRepetitionModeId ?? repetitionModeIdRef.current;
    const instanceIndex = urlInstanceIndex ?? instanceIndexRef.current;
    if (repetitionModeId == null || instanceIndex == null || !layoutReady || classroomId <= 0) {
      return;
    }
    if (isTutorUser == null) return;

    const deeplinkKey = scheduleDlToken ?? `rep:${repetitionModeId}:${instanceIndex}`;
    if (lastProcessedRepeatedDeeplinkRef.current === deeplinkKey) return;

    let aborted = false;

    void (async () => {
      const detailsKey = isTutorUser
        ? schedulerQueryKeys.tutorRepeatedEventInstanceDetails(
            classroomId,
            repetitionModeId,
            instanceIndex,
          )
        : schedulerQueryKeys.studentRepeatedEventInstanceDetails(
            classroomId,
            repetitionModeId,
            instanceIndex,
          );

      await queryClient.invalidateQueries({ queryKey: detailsKey });
      await queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.tutorAllForClassroom(classroomId),
      });
      await queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.studentAllForClassroom(classroomId),
      });
      await queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.tutorScheduleAll() });
      await queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.studentScheduleAll() });

      try {
        const data = await queryClient.fetchQuery({
          queryKey: detailsKey,
          queryFn: () =>
            isTutorUser
              ? getTutorRepeatedEventInstanceDetails({
                  classroomId,
                  repetitionModeId,
                  instanceIndex,
                })
              : getStudentRepeatedEventInstanceDetails({
                  classroomId,
                  repetitionModeId,
                  instanceIndex,
                }),
        });

        if (aborted) return;

        lastProcessedRepeatedDeeplinkRef.current = deeplinkKey;

        const startAt = readInstanceStartsAt(data);
        const anchor =
          startAt != null && Number.isFinite(startAt.getTime()) ? startOfDay(startAt) : null;

        if (readInstanceIsCancelled(data)) {
          setPendingEventToOpen(null);
          if (anchor != null) {
            setPendingAnchorDate(anchor);
            setMobileScheduleAnchorTs(anchor.getTime());
            setPendingAnchorToken((t) => t + 1);
          }
          scheduleStrip();
          return;
        }

        const event = mapInstanceDetailsToCalendarEvent(data, classroomId);
        const fallbackStart = anchor ?? startOfDay(new Date(event.start));

        setPendingEventToOpen(event);
        if (Number.isFinite(fallbackStart.getTime())) {
          setPendingAnchorDate(fallbackStart);
          setMobileScheduleAnchorTs(fallbackStart.getTime());
          setPendingAnchorToken((t) => t + 1);
        }
      } catch {
        if (!aborted) {
          lastProcessedRepeatedDeeplinkRef.current = deeplinkKey;
          scheduleStrip();
        }
      }
    })();

    return () => {
      aborted = true;
    };
  }, [
    urlRepetitionModeId,
    urlInstanceIndex,
    scheduleDlToken,
    layoutReady,
    classroomId,
    isTutorUser,
    queryClient,
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
