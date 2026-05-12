import { toLocalISOString } from './dateTimezone';

/** Диапазон `[happensAfter, happensBefore]` для запроса всех занятий за календарный локальный день. */
export const getCalendarDayQueryRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return {
    // Отправляем в timezone пользователя: бэкенд принимает timestamp с любым offset
    happensAfter: toLocalISOString(start),
    happensBefore: toLocalISOString(new Date(end.getTime() + 1)),
  };
};
