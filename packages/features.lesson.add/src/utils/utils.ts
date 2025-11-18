export const getFullDateString = (date: Date, format: 'short' | 'long' = 'short') => {
  const weekDayName = date.toLocaleDateString('ru-RU', { weekday: format });
  const monthName = date.toLocaleDateString('ru-RU', { month: 'long' });

  return `${weekDayName} ${date.getDate()} ${monthName}`;
};
