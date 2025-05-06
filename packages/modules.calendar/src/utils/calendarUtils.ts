import { isSameDay } from 'date-fns';

export const isCurrentMonth = (date: Date, monthIndex: number) => {
  return date.getMonth() === monthIndex;
};

export const isCurrentDay = (date: Date, day: Date) => isSameDay(date, day);

export const isWeekend = (day: Date) => {
  const weekday = day.getDay();
  return weekday === 0 || weekday === 6;
}; 

export const timeToString = (time: Date) => {
  const hoursToString = time.getHours() < 10 ? `0${time.getHours()}` : time.getHours();
  const minutesToString = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();

  return `${hoursToString}:${minutesToString}`;
};
