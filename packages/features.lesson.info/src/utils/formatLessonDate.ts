/** Дата занятия: «13 июня, сб.» */
export function formatLessonDate(date: Date, locale: string = 'ru-RU'): string {
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const weekDayShort = date.toLocaleDateString(locale, { weekday: 'short' });
  return `${dayAndMonth}, ${weekDayShort}`;
}
