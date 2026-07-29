import type { TFunction } from 'i18next';
import { getDateLocale } from 'common.ui';

export const getFullDateString = (
  date: Date,
  format: 'short' | 'long' = 'short',
  locale: string = getDateLocale(),
) => {
  const weekDayName = date.toLocaleDateString(locale, { weekday: format });
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });

  return `${weekDayName} ${dayAndMonth}`;
};

/** Формат как в макете: "6 февраля, вс" */
export const getShortDateString = (date: Date, locale: string = getDateLocale()): string => {
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const weekDayShort = date.toLocaleDateString(locale, { weekday: 'short' });
  return `${dayAndMonth}, ${weekDayShort}`;
};

/** Перевести время "HH:MM" в минуты от полуночи */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const MINUTES_PER_DAY = 24 * 60;

/** Максимальная длительность занятия (минуты) */
export const MAX_LESSON_DURATION_MINUTES = 12 * 60;

/**
 * Длительность между startTime и endTime в минутах.
 * Если endTime <= startTime, считаем, что окончание на следующий день.
 */
export const durationBetweenMinutes = (startTime: string, endTime: string): number => {
  const startM = timeToMinutes(startTime);
  const endM = timeToMinutes(endTime);
  if (endM > startM) return endM - startM;
  if (endM < startM) return MINUTES_PER_DAY - startM + endM;
  return 0;
};

/** Минуты от полуночи в "HH:MM" */
export const minutesToTime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** startTime "HH:MM" + duration "H:MM" → endTime "HH:MM" */
export const addDurationToTime = (startTime: string, duration: string): string => {
  const startMin = timeToMinutes(startTime);
  const [durHours, durMinutes] = duration.split(':').map(Number);
  const durationMin = durHours * 60 + durMinutes;
  return minutesToTime(startMin + durationMin);
};

/** Длительность между двумя временами в формате макета: «1 час 20 минут». Пустая строка, если посчитать нельзя. */
export const formatDurationBetween = (startTime: string, endTime: string, t: TFunction): string => {
  if (!/^\d{1,2}:\d{2}$/.test(startTime) || !/^\d{1,2}:\d{2}$/.test(endTime)) {
    return '';
  }

  const diff = durationBetweenMinutes(startTime, endTime);
  if (diff <= 0) return '';

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(t('hours', { count: hours }));
  }
  if (minutes > 0) {
    parts.push(t('minutes', { count: minutes }));
  }

  return parts.length ? parts.join(' ') : '';
};
