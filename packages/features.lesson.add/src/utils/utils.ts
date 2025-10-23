import { parse } from 'date-fns';

export const getFullDateString = (date: Date) => {
  const weekDayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
  const monthName = date.toLocaleDateString('ru-RU', { month: 'long' });

  return `${weekDayName} ${date.getDate()} ${monthName}`;
};

export const convertStringToDate = (dateString: string): Date => {
  return parse(dateString, 'dd.MM.yyyy', new Date());
};
