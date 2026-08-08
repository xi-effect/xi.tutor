import { getDateLocale } from 'common.ui';

/** Дата занятия: «13 июня, сб.» */
export function formatLessonDate(date: Date, locale: string = getDateLocale()): string {
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const weekDayShort = date.toLocaleDateString(locale, { weekday: 'short' });
  return `${dayAndMonth}, ${weekDayShort}`;
}
