import { useCallback, useEffect, useState } from 'react';

export type ScheduleWorkingHours = {
  from: string;
  to: string;
};

export const SCHEDULE_WORKING_HOURS_STORAGE_KEY = 'xi_schedule_working_hours';
export const DEFAULT_SCHEDULE_WORKING_HOURS: ScheduleWorkingHours = {
  from: '08:00',
  to: '22:00',
};

const CHANGE_EVENT = 'xi:schedule-working-hours-change';
const COMPLETE_TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const isValidScheduleWorkingHours = (value: unknown): value is ScheduleWorkingHours => {
  if (!value || typeof value !== 'object') return false;
  const from = 'from' in value ? value.from : null;
  const to = 'to' in value ? value.to : null;
  if (typeof from !== 'string' || typeof to !== 'string') return false;
  if (!COMPLETE_TIME_RE.test(from) || !COMPLETE_TIME_RE.test(to)) return false;
  return timeToMinutes(from) < timeToMinutes(to);
};

export const readScheduleWorkingHours = (): ScheduleWorkingHours => {
  try {
    const raw = localStorage.getItem(SCHEDULE_WORKING_HOURS_STORAGE_KEY);
    if (!raw) return DEFAULT_SCHEDULE_WORKING_HOURS;
    const parsed: unknown = JSON.parse(raw);
    if (isValidScheduleWorkingHours(parsed)) return parsed;
  } catch {
    // ignore
  }
  return DEFAULT_SCHEDULE_WORKING_HOURS;
};

export const writeScheduleWorkingHours = (hours: ScheduleWorkingHours) => {
  if (!isValidScheduleWorkingHours(hours)) return;
  try {
    localStorage.setItem(SCHEDULE_WORKING_HOURS_STORAGE_KEY, JSON.stringify(hours));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

export const useScheduleWorkingHours = () => {
  const [workingHours, setWorkingHoursState] =
    useState<ScheduleWorkingHours>(readScheduleWorkingHours);

  useEffect(() => {
    const handler = () => setWorkingHoursState(readScheduleWorkingHours());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setWorkingHours = useCallback((hours: ScheduleWorkingHours) => {
    writeScheduleWorkingHours(hours);
    setWorkingHoursState(hours);
  }, []);

  return { workingHours, setWorkingHours };
};
