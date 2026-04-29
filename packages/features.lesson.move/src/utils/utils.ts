const DEFAULT_LOCALE = 'ru-RU';

/** Формат как в макете: "6 февраля, вс" */
export const getShortDateString = (date: Date, locale: string = DEFAULT_LOCALE): string => {
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const weekDayShort = date.toLocaleDateString(locale, { weekday: 'short' });
  return `${dayAndMonth}, ${weekDayShort}`;
};

/** Перевести время "HH:MM" в минуты от полуночи */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Минуты от полуночи в "HH:MM" */
export const minutesToTime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** startTime "HH:MM" + duration "H:MM" -> endTime "HH:MM" */
export const addDurationToTime = (startTime: string, duration: string): string => {
  const startMin = timeToMinutes(startTime);
  const [durHours, durMinutes] = duration.split(':').map(Number);
  const durationMin = durHours * 60 + durMinutes;
  return minutesToTime(startMin + durationMin);
};

const pluralRu = (n: number, one: string, few: string, many: string): string => {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
};

/** Длительность между двумя временами в формате макета: «1 час 20 минут». Пустая строка, если посчитать нельзя. */
export const formatDurationBetweenRu = (startTime: string, endTime: string): string => {
  if (!/^\d{1,2}:\d{2}$/.test(startTime) || !/^\d{1,2}:\d{2}$/.test(endTime)) {
    return '';
  }
  const diff = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (diff <= 0) return '';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  const parts: string[] = [];
  if (h > 0) {
    parts.push(`${h} ${pluralRu(h, 'час', 'часа', 'часов')}`);
  }
  if (m > 0) {
    parts.push(`${m} ${pluralRu(m, 'минута', 'минуты', 'минут')}`);
  }
  return parts.length ? parts.join(' ') : '';
};

/** Дата для сводки: «6 апреля» */
export const getDayMonthRu = (date: Date, locale: string = DEFAULT_LOCALE): string => {
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
};

/** Полные названия дней недели (именительный падеж), индекс 0 = пн */
export const WEEKDAY_FULL_NAMES: readonly string[] = [
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
  'воскресенье',
];
