import { format, isBefore, isSameDay, startOfDay, parse } from 'date-fns';

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

const formatRuDatePart = (date: Date, withYear: boolean): string => {
  const s = date.toLocaleDateString(
    'ru-RU',
    withYear
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'long' },
  );
  return s.replace(/\s*г\.?$/, '').trim();
};

/** Диапазон для кнопки DatePicker: «2 марта — 8 марта»; при смене года — «30 декабря 2025 — 3 января 2026» */
export const formatDateRangeDisplay = (weekStart: Date, dayCount: number): string => {
  const days = Math.max(1, Math.min(7, dayCount));
  const end = new Date(weekStart);
  end.setDate(end.getDate() + days - 1);
  const crossesYear = weekStart.getFullYear() !== end.getFullYear();
  const startLabel = formatRuDatePart(weekStart, crossesYear);
  const endLabel = formatRuDatePart(end, crossesYear);
  return `${startLabel} — ${endLabel}`;
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

const LESSON_CARD_SKELETON_COUNT_MIN = 2;
const LESSON_CARD_SKELETON_COUNT_MAX = 5;

/**
 * Псевдослучайное число скелетонов карточек для календарного дня.
 * Одна и та же дата всегда даёт одно значение (без мерцания при ре-рендерах).
 */
export const getLessonCardSkeletonCountForDay = (
  day: Date,
  min: number = LESSON_CARD_SKELETON_COUNT_MIN,
  max: number = LESSON_CARD_SKELETON_COUNT_MAX,
): number => {
  const key = format(startOfDay(day), 'yyyy-MM-dd');
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  const span = Math.max(1, max - min + 1);
  return min + (Math.abs(h) % span);
};
