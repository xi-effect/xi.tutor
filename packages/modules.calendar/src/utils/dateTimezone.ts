import { formatWallClockISOString } from 'common.utils';

/**
 * Форматирует дату в ISO-строку с явным timezone offset пользователя.
 *
 * Локальные поля Date — гражданское время, которое видит пользователь.
 * Offset берётся из часового пояса приложения (настройки профиля), а не из ОС.
 *
 * Используется для сериализации `starts_at` при создании/переносе занятий,
 * а также для `happens_after` / `happens_before` в query-параметрах расписания.
 *
 * @example
 * // Пояс приложения UTC+3, поля даты 09:00
 * toLocalISOString(new Date(2023, 9, 15, 9, 0, 0)) // "2023-10-15T09:00:00+03:00"
 */
export function toLocalISOString(date: Date, timeZone?: string): string {
  return formatWallClockISOString(date, timeZone);
}
