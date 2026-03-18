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
