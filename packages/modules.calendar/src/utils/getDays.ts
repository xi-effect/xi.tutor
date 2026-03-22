import {
  addDays,
  addWeeks,
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

/** Дни начиная с start в количестве count */
export const getDaysFrom = (start: Date, count: number): Date[] => {
  const end = addDays(start, count - 1);
  return eachDayOfInterval({ start, end });
};

export const getWeeksNumbers = (days: Date[]) => {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks.map((week) => getWeek(week[0]));
};

/**
 * Подряд идущие календарные дни на нескольких неделях (для «бесконечной» ленты свайпа по дням).
 * weekAnchor — любой день недели; берутся недели от (anchor − weeksBefore) до (anchor + weeksAfter).
 */
export const getWeeksRangeDays = (
  weekAnchor: Date,
  weeksBefore: number,
  weeksAfter: number,
): Date[] => {
  const days: Date[] = [];
  for (let w = -weeksBefore; w <= weeksAfter; w++) {
    const week = addWeeks(weekAnchor, w);
    getWeekDays(week).forEach((d) => days.push(new Date(d)));
  }
  return days;
};
