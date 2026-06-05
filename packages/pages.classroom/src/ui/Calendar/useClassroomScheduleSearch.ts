import { useMemo } from 'react';
import { useLocation, useSearch } from '@tanstack/react-router';

export type ClassroomScheduleSearchParams = {
  tab?: string;
  focused_at?: string;
  event_instance_id?: string;
  /** Служебный токен диплинка из уведомления (сбрасывается после обработки) */
  schedule_dl?: string;
};

/**
 * Search-параметры диплинка расписания кабинета.
 * Берём из route search и дублируем из window.location — navigate иногда обновляет URL,
 * но typed search роутера может отставать.
 */
export function useClassroomScheduleSearch(): ClassroomScheduleSearchParams {
  const location = useLocation();
  const routeSearch = useSearch({
    from: '/(app)/_layout/classrooms/$classroomId/',
  }) as ClassroomScheduleSearchParams;

  return useMemo(() => {
    const hrefParams =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

    const read = (key: keyof ClassroomScheduleSearchParams): string | undefined => {
      const fromRoute = routeSearch[key];
      if (typeof fromRoute === 'string' && fromRoute.trim().length > 0) {
        return fromRoute.trim();
      }

      const fromHref = hrefParams.get(key);
      return fromHref?.trim() || undefined;
    };

    return {
      tab: read('tab'),
      focused_at: read('focused_at'),
      event_instance_id: read('event_instance_id'),
      schedule_dl: read('schedule_dl'),
    };
  }, [routeSearch, location.href, location.search]);
}
