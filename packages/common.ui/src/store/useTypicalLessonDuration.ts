import { useCallback, useEffect, useState } from 'react';

export const TYPICAL_LESSON_DURATION_STORAGE_KEY = 'xi_typical_lesson_duration_minutes';
export const DEFAULT_TYPICAL_LESSON_DURATION_MINUTES = 60;
export const MIN_TYPICAL_LESSON_DURATION_MINUTES = 15;
export const MAX_TYPICAL_LESSON_DURATION_MINUTES = 12 * 60;

const CHANGE_EVENT = 'xi:typical-lesson-duration-change';

export const isValidTypicalLessonDurationMinutes = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= MIN_TYPICAL_LESSON_DURATION_MINUTES &&
  value <= MAX_TYPICAL_LESSON_DURATION_MINUTES &&
  value % 15 === 0;

export const readTypicalLessonDurationMinutes = (): number => {
  try {
    const raw = localStorage.getItem(TYPICAL_LESSON_DURATION_STORAGE_KEY);
    if (!raw) return DEFAULT_TYPICAL_LESSON_DURATION_MINUTES;
    const parsed: unknown = JSON.parse(raw);
    if (isValidTypicalLessonDurationMinutes(parsed)) return parsed;
  } catch {
    // ignore
  }
  return DEFAULT_TYPICAL_LESSON_DURATION_MINUTES;
};

export const writeTypicalLessonDurationMinutes = (minutes: number) => {
  if (!isValidTypicalLessonDurationMinutes(minutes)) return;
  try {
    localStorage.setItem(TYPICAL_LESSON_DURATION_STORAGE_KEY, JSON.stringify(minutes));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

export const useTypicalLessonDuration = () => {
  const [durationMinutes, setDurationMinutesState] = useState(readTypicalLessonDurationMinutes);

  useEffect(() => {
    const handler = () => setDurationMinutesState(readTypicalLessonDurationMinutes());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setDurationMinutes = useCallback((minutes: number) => {
    if (!isValidTypicalLessonDurationMinutes(minutes)) return;
    writeTypicalLessonDurationMinutes(minutes);
    setDurationMinutesState(minutes);
  }, []);

  return { durationMinutes, setDurationMinutes };
};
