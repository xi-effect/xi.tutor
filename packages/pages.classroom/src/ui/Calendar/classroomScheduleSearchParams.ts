import type { ClassroomScheduleSearchParams } from './useClassroomScheduleSearch';

const DEEPLINK_KEYS = [
  'focused_at',
  'event_instance_id',
  'repetition_mode_id',
  'instance_index',
  'schedule_dl',
] as const;

function readHrefParam(key: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const value = new URLSearchParams(window.location.search).get(key);
  return value?.trim() || undefined;
}

/** В URL есть активный диплинк расписания (актуальный href важнее отстающего search роутера). */
export function hrefHasScheduleDeeplink(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return DEEPLINK_KEYS.some((key) => params.has(key));
}

/**
 * Читает search: для диплинка приоритет у `window.location` (router search часто отстаёт после navigate).
 */
export function mergeClassroomScheduleSearch(
  routeSearch: ClassroomScheduleSearchParams,
): ClassroomScheduleSearchParams {
  const preferHref = hrefHasScheduleDeeplink();

  const read = (key: keyof ClassroomScheduleSearchParams): string | undefined => {
    const fromHref = readHrefParam(key);
    const fromRoute = routeSearch[key];
    const routeValue =
      typeof fromRoute === 'string' && fromRoute.trim().length > 0 ? fromRoute.trim() : undefined;

    if (preferHref && fromHref) return fromHref;
    return routeValue ?? fromHref;
  };

  return {
    tab: read('tab'),
    focused_at: read('focused_at'),
    event_instance_id: read('event_instance_id'),
    repetition_mode_id: read('repetition_mode_id'),
    instance_index: read('instance_index'),
    schedule_dl: read('schedule_dl'),
  };
}
