import { useMemo } from 'react';
import { 
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  getDay,
} from 'date-fns';

function useYearlyCalendar(year: number) {
  
  const yearCalendar = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(yearStart);
    
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    
    return months.map(monthDate => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      
      return {
        days
      };
    });
  }, [year]);
  
  
  const isCurrentMonth = (date: Date, monthIndex: number) => date.getMonth() === monthIndex;

  const isCurrentDay = (date: Date, day: Date) => isSameDay(date, day);

  const isWeekend = (day: Date) => {
    const weekday = getDay(day);
    return weekday === 0 || weekday === 6;
  };
  
  
  return {
    yearCalendar,
    isCurrentMonth,
    isCurrentDay,
    isWeekend
  };
}

export default useYearlyCalendar;