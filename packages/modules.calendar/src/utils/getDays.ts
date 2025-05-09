import {
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getWeek,
} from 'date-fns';

export const getMonthDays = (currentDate: Date): Date[] => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days;
};

export const getYearDays = (currentDate: Date) => {
  const yearStart = startOfYear(new Date(currentDate.getFullYear(), 0, 1));
  const yearEnd = endOfYear(yearStart);

  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  return months.map((monthDate) => {
    const days = getMonthDays(monthDate);

    return days;
  });
};

export const getWeekDays = (currentDate: Date) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: weekStart, end: weekEnd });
};

export const getWeeksNumbers = (days: Date[]) => {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks.map((week) => getWeek(week[0]));
};
