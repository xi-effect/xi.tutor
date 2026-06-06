import { useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { mergeClassroomScheduleSearch } from './classroomScheduleSearchParams';

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
  const routeSearch = useSearch({
    from: '/(app)/_layout/classrooms/$classroomId/',
  }) as ClassroomScheduleSearchParams;

  return useMemo(
    () => mergeClassroomScheduleSearch(routeSearch),
    [routeSearch, typeof window !== 'undefined' ? window.location.search : ''],
  );
}
