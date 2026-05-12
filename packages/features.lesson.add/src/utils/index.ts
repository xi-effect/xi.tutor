const DEFAULT_LOCALE = 'ru-RU';

export const getFullDateString = (
  date: Date,
  format: 'short' | 'long' = 'short',
  locale: string = DEFAULT_LOCALE,
) => {
  const weekDayName = date.toLocaleDateString(locale, { weekday: format });
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });

  return `${weekDayName} ${dayAndMonth}`;
};

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

/** startTime "HH:MM" + duration "H:MM" → endTime "HH:MM" */
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

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${pluralRu(hours, 'час', 'часа', 'часов')}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${pluralRu(minutes, 'минута', 'минуты', 'минут')}`);
  }

  return parts.length ? parts.join(' ') : '';
};
