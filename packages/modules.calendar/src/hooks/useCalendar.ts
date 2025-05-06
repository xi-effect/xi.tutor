import { useMemo } from 'react';

import { getMonthDays, getWeekDays, getYearDays } from '../utils';

const currentDate = new Date(Date.now());

export const useCalendar = () => {
  const days = useMemo(() => {
    return {
      day: [currentDate],
      week: getWeekDays(currentDate),
      month: getMonthDays(currentDate),
      year: getYearDays(currentDate),
    };
  }, []);

  return { days, currentDate };
};
