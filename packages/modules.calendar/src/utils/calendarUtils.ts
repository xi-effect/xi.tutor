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

export const getFullDateString = (date: Date) => {
  const weekDayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
  const monthName = date.toLocaleDateString('ru-RU', { month: 'long' });

  return `${weekDayName} ${date.getDate()} ${monthName}`;
};

export const convertStringToDate = (dateString: string): Date => {
  return parse(dateString, 'dd.MM.yyyy', new Date());
};

export const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}.${mm}.${yyyy}`;
};

/** Формат диапазона для кнопки DatePicker: ДД.ММ.ГГ - ДД.ММ.ГГГГ */
export const formatDateRangeDisplay = (weekStart: Date, dayCount: number): string => {
  const days = Math.max(1, Math.min(7, dayCount));
  const end = new Date(weekStart);
  end.setDate(end.getDate() + days - 1);
  const d1 = String(weekStart.getDate()).padStart(2, '0');
  const m1 = String(weekStart.getMonth() + 1).padStart(2, '0');
  const y1 = String(weekStart.getFullYear()).slice(-2);
  const d2 = String(end.getDate()).padStart(2, '0');
  const m2 = String(end.getMonth() + 1).padStart(2, '0');
  const y2 = String(end.getFullYear());
  return `${d1}.${m1}.${y1} - ${d2}.${m2}.${y2}`;
};

export const formatWeekRange = (weekStart: Date): string => {
  return formatDateRange(weekStart, 7);
};

/** Диапазон дат от weekStart на dayCount дней (для заголовка при видимых столбцах канбана) */
export const formatDateRange = (weekStart: Date, dayCount: number): string => {
  const days = Math.max(1, Math.min(7, dayCount));
  const end = new Date(weekStart);
  end.setDate(end.getDate() + days - 1);
  const d1 = weekStart.getDate();
  const d2 = end.getDate();
  const m1 = weekStart.toLocaleDateString('ru-RU', { month: 'long' });
  const m2 = end.toLocaleDateString('ru-RU', { month: 'long' });
  const y = weekStart.getFullYear();
  if (m1 === m2) {
    return `${d1} - ${d2} ${m1} ${y}`;
  }
  return `${d1} ${m1} - ${d2} ${m2} ${y}`;
};
