import { useEffect, useRef } from 'react';

import type { ICalendarEvent } from '../ui/types';

export function findCalendarEventByInstanceId(
  events: ICalendarEvent[],
  instanceId: string,
): ICalendarEvent | undefined {
  return events.find((e) => e.scheduler?.eventInstanceId === instanceId || e.id === instanceId);
}

/**
 * Когда загрузилось расписание, открыть модалку «Информация о занятии» по persisted `event_instance_id`.
 */
export function useOpenLessonByInstanceWhenLoaded(options: {
  instanceId?: string | null;
  events: ICalendarEvent[];
  eventsLoading: boolean;
  openLessonInfo: (event: ICalendarEvent) => void;
  onConsumed?: () => void;
}): void {
  const { instanceId, events, eventsLoading, openLessonInfo, onConsumed } = options;

  const openRef = useRef(openLessonInfo);
  openRef.current = openLessonInfo;
  const onConsumedRef = useRef(onConsumed);
  onConsumedRef.current = onConsumed;

  const normalized =
    typeof instanceId === 'string' && instanceId.trim().length > 0 ? instanceId.trim() : null;

  useEffect(() => {
    if (normalized == null) return;
    if (eventsLoading) return;

    const found = findCalendarEventByInstanceId(events, normalized);
    if (!found) return;

    openRef.current(found);
    onConsumedRef.current?.();
  }, [normalized, events, eventsLoading]);
}
