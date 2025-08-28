import { isBefore, isSameDay, startOfDay, parse } from 'date-fns';

export const isCurrentMonth = (date: Date, monthIndex: number) => {
  return date.getMonth() === monthIndex;
};

export const isCurrentDay = (date: Date, day: Date) => isSameDay(date, day);

export const isWeekend = (day: Date) => {
  const weekday = day.getDay();
  return weekday === 0 || weekday === 6;
};

export const isPastDay = (day: Date, today: Date) => {
  return isBefore(day, startOfDay(today)) && !isSameDay(day, startOfDay(today));
};

export const timeToString = (time: Date) => {
  const hoursToString = time.getHours() < 10 ? `0${time.getHours()}` : time.getHours();
  const minutesToString = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();

  return `${hoursToString}:${minutesToString}`;
};

export const parseDateTime = (dateStr: string, timeStr: string) =>
  parse(`${dateStr} ${timeStr}`, 'dd.MM.yyyy HH:mm', new Date());

export const dateToString = (date: string) => {
  const [d, m, y] = date.split('.');
  const dateObj = new Date(+y, +m - 1, +d);
  const weekDayName = dateObj.toLocaleDateString('ru-RU', { weekday: 'short' });
  const monthName = dateObj.toLocaleDateString('ru-RU', { month: 'long' });

  return `${weekDayName} ${d} ${monthName}`;
};
