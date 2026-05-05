/**
 * Форматирует дату в ISO-строку с явным timezone offset пользователя.
 *
 * `Date.prototype.toISOString()` всегда возвращает UTC ("Z"), теряя информацию
 * о реальном часовом поясе. Эта функция сохраняет локальный offset.
 *
 * Используется для сериализации `starts_at` при создании/переносе занятий,
 * а также для `happens_after` / `happens_before` в query-параметрах расписания.
 *
 * @example
 * // Пользователь в UTC+3, локальное время 09:00
 * toLocalISOString(new Date("2023-10-15T09:00:00")) // "2023-10-15T09:00:00+03:00"
 *
 * // UTC (offset 0)
 * toLocalISOString(new Date("2023-10-15T09:00:00Z")) // "2023-10-15T09:00:00+00:00"
 */
export function toLocalISOString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  // getTimezoneOffset() возвращает разницу UTC − local в минутах (UTC+3 → -180)
  const tzOffset = -date.getTimezoneOffset();
  const sign = tzOffset >= 0 ? '+' : '-';
  const absOffset = Math.abs(tzOffset);
  const offsetHours = Math.floor(absOffset / 60);
  const offsetMinutes = absOffset % 60;

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(offsetHours)}:${pad(offsetMinutes)}`
  );
}
