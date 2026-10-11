import { addDays } from 'date-fns';
import { instantToWallClock } from 'common.utils';
import { toLocalISOString } from './dateTimezone';

/** Сутки вокруг выбранного дня: смена пояса переносит начало на соседний день. */
const DAY_QUERY_PAD = 1;

/**
 * Диапазон `[happensAfter, happensBefore]` шире календарного дня на сутки с каждой стороны.
 * В списке дня остаются только занятия, у которых начало попадает в этот день.
 */
export const getCalendarDayQueryRange = (date: Date, timeZone?: string) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const from = addDays(start, -DAY_QUERY_PAD);
  const to = addDays(start, DAY_QUERY_PAD + 1);
  return {
    happensAfter: toLocalISOString(from, timeZone),
    happensBefore: toLocalISOString(to, timeZone),
  };
};

export const lessonStartsOnDay = (startsAt: string, day: Date, timeZone?: string): boolean => {
  const start = instantToWallClock(startsAt, timeZone);
  if (Number.isNaN(start.getTime())) return false;
  return (
    start.getFullYear() === day.getFullYear() &&
    start.getMonth() === day.getMonth() &&
    start.getDate() === day.getDate()
  );
};
