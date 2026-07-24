import { getDateLocale } from 'common.ui';

/** Дата в строке макета: «12 марта, чт.» / «March 12, Thu» */
export function formatUpcomingDate(date: Date, locale: string = getDateLocale()): string {
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const weekDayShort = date.toLocaleDateString(locale, { weekday: 'short' });
  return `${dayAndMonth}, ${weekDayShort}`;
}
