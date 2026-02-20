const DEFAULT_LOCALE = 'ru-RU';

export const getFullDateString = (
  date: Date,
  format: 'short' | 'long' = 'short',
  locale: string = DEFAULT_LOCALE,
) => {
  const weekDayName = date.toLocaleDateString(locale, { weekday: format });
  const monthName = date.toLocaleDateString(locale, { month: 'long' });

  return `${weekDayName} ${date.getDate()} ${monthName}`;
};
