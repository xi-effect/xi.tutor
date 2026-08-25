import type { TFunction } from 'i18next';
import { getDateLocale } from 'common.ui';

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

/** startTime "HH:MM" + duration "H:MM" -> endTime "HH:MM" */
export const addDurationToTime = (startTime: string, duration: string): string => {
  const startMin = timeToMinutes(startTime);
  const [durHours, durMinutes] = duration.split(':').map(Number);
  const durationMin = durHours * 60 + durMinutes;
  return minutesToTime(startMin + durationMin);
};

export const TIME_MINUTE_STEPS = [0, 15, 30, 45] as const;

const COMPLETE_TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

export const parseTimeParts = (time: string): { hours: number; minutes: number } | null => {
  if (!COMPLETE_TIME_RE.test(time)) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
};

export const formatTimeParts = (hours: number, minutes: number): string =>
  `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

const validSlotMinutesAfter = (minTime: string, maxDurationMinutes: number): number[] => {
  const startM = timeToMinutes(minTime);
  const slots: number[] = [];
  for (let offset = 15; offset <= maxDurationMinutes; offset += 15) {
    slots.push((startM + offset) % MINUTES_PER_DAY);
  }
  return slots;
};

/** Часы для дропдауна. Для конца занятия — по порядку от времени начала, с учётом лимита длительности. */
export const getTimePickerHours = (
  minTime?: string,
  maxDurationMinutes: number = MAX_LESSON_DURATION_MINUTES,
): number[] => {
  if (!minTime || !parseTimeParts(minTime)) {
    return Array.from({ length: 24 }, (_, i) => i);
  }

  const hours: number[] = [];
  const seen = new Set<number>();
  for (const total of validSlotMinutesAfter(minTime, maxDurationMinutes)) {
    const hour = Math.floor(total / 60);
    if (!seen.has(hour)) {
      seen.add(hour);
      hours.push(hour);
    }
  }
  return hours;
};

/** Минуты 00/15/30/45, допустимые для выбранного часа относительно времени начала. */
export const getTimePickerMinutes = (
  hour: number,
  minTime?: string,
  maxDurationMinutes: number = MAX_LESSON_DURATION_MINUTES,
): number[] => {
  const steps = [...TIME_MINUTE_STEPS];
  if (!minTime || !parseTimeParts(minTime)) return steps;

  const startM = timeToMinutes(minTime);
  return steps.filter((minutes) => {
    const candidate = hour * 60 + minutes;
    let duration = candidate - startM;
    if (duration <= 0) duration += MINUTES_PER_DAY;
    return duration > 0 && duration <= maxDurationMinutes;
  });
};

/**
 * Если конец пустой или становится невалидным относительно начала — вернуть start + 1 час.
 * Иначе undefined (значение конца менять не нужно).
 */
export const resolveSyncedEndTime = (startTime: string, endTime: string): string | undefined => {
  if (!parseTimeParts(startTime)) return undefined;
  if (!parseTimeParts(endTime)) {
    return addDurationToTime(startTime, '1:00');
  }

  const duration = durationBetweenMinutes(startTime, endTime);
  if (duration === 0 || duration > MAX_LESSON_DURATION_MINUTES) {
    return addDurationToTime(startTime, '1:00');
  }

  return undefined;
};

/** Длительность между двумя временами в формате макета: «1 час 20 минут». Пустая строка, если посчитать нельзя. */
export const formatDurationBetween = (startTime: string, endTime: string, t: TFunction): string => {
  if (!/^\d{1,2}:\d{2}$/.test(startTime) || !/^\d{1,2}:\d{2}$/.test(endTime)) {
    return '';
  }
  const diff = durationBetweenMinutes(startTime, endTime);
  if (diff <= 0) return '';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  const parts: string[] = [];
  if (h > 0) {
    parts.push(t('hours', { count: h }));
  }
  if (m > 0) {
    parts.push(t('minutes', { count: m }));
  }
  return parts.length ? parts.join(' ') : '';
};

/** Дата для сводки: «6 апреля» */
export const getDayMonth = (date: Date, locale: string = getDateLocale()): string => {
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
};
