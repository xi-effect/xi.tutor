/** Дата в строке макета: «12 марта, чт.» (локаль ru) */
export function formatUpcomingDate(date: Date, locale: string = 'ru-RU'): string {
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const weekDayShort = date.toLocaleDateString(locale, { weekday: 'short' });
  return `${dayAndMonth}, ${weekDayShort}`;
}
