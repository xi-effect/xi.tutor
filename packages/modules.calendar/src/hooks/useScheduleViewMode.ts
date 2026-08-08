import { useCallback, useEffect, useState } from 'react';

export type ScheduleViewMode = 'auto' | 'full-week';

export const SCHEDULE_VIEW_MODE_STORAGE_KEY = 'xi_schedule_view_mode';

/** Кастомное событие для синхронизации внутри одной вкладки */
const CHANGE_EVENT = 'xi:schedule-view-mode-change';

const readFromStorage = (): ScheduleViewMode => {
  try {
    const raw = localStorage.getItem(SCHEDULE_VIEW_MODE_STORAGE_KEY);
    if (raw === 'full-week') return 'full-week';
  } catch {
    // ignore
  }
  return 'auto';
};

export const writeScheduleViewMode = (mode: ScheduleViewMode) => {
  try {
    localStorage.setItem(SCHEDULE_VIEW_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

export const useScheduleViewMode = () => {
  const [viewMode, setViewModeState] = useState<ScheduleViewMode>(readFromStorage);

  useEffect(() => {
    const handler = () => setViewModeState(readFromStorage());
    window.addEventListener(CHANGE_EVENT, handler);
    // Также слушаем storage для синхронизации между вкладками
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setViewMode = useCallback((mode: ScheduleViewMode) => {
    writeScheduleViewMode(mode);
  }, []);

  return { viewMode, setViewMode };
};
