/**
 * Часовой пояс приложения.
 *
 * Пока пользователь не выбрал пояс в настройках, берётся пояс устройства.
 * Выбор хранится локально: в профиле API отдельного поля нет.
 *
 * Даты в интерфейсе календаря — «настенные»: локальные поля Date совпадают
 * с гражданским временем выбранного пояса. Сериализация в API пишет эти поля
 * с offset этого пояса, а не с offset операционной системы.
 */

export const TIMEZONE_STORAGE_KEY = 'xi_timezone';

export const PINNED_TIME_ZONES = [
  'Europe/Kaliningrad',
  'Europe/Moscow',
  'Europe/Samara',
  'Asia/Yekaterinburg',
  'Asia/Omsk',
  'Asia/Novosibirsk',
  'Asia/Krasnoyarsk',
  'Asia/Irkutsk',
  'Asia/Yakutsk',
  'Asia/Vladivostok',
  'Asia/Magadan',
  'Asia/Kamchatka',
] as const;

const CHANGE_EVENT = 'xi:timezone-change';

type Listener = () => void;

const listeners = new Set<Listener>();
let revision = 0;

export const getAppTimeZoneRevision = (): number => revision;

/** `undefined` — ещё не читали storage. `null` — режим «как на устройстве». */
let cachedZone: string | null | undefined;

export type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export const isValidTimeZone = (value: string): boolean => {
  if (value.length === 0) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const getSystemTimeZone = (): string => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof zone === 'string' && isValidTimeZone(zone)) return zone;
  } catch {
    // Intl недоступен
  }
  return 'UTC';
};

const readStoredZone = (): string | null => {
  if (cachedZone !== undefined) return cachedZone;
  cachedZone = null;
  try {
    const stored = globalThis.localStorage?.getItem(TIMEZONE_STORAGE_KEY);
    if (typeof stored === 'string' && isValidTimeZone(stored)) {
      cachedZone = stored;
    }
  } catch {
    cachedZone = null;
  }
  return cachedZone;
};

export const getAppTimeZone = (): string => readStoredZone() ?? getSystemTimeZone();

export const isAppTimeZoneAutomatic = (): boolean => readStoredZone() == null;

const notify = () => {
  revision += 1;
  listeners.forEach((listener) => listener());
  try {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // нет window
  }
};

/** `null` — снова определять пояс по устройству. */
export const setAppTimeZone = (timeZone: string | null): void => {
  if (timeZone != null && !isValidTimeZone(timeZone)) return;
  if (readStoredZone() === timeZone) return;

  cachedZone = timeZone;
  try {
    if (timeZone == null) {
      globalThis.localStorage?.removeItem(TIMEZONE_STORAGE_KEY);
    } else {
      globalThis.localStorage?.setItem(TIMEZONE_STORAGE_KEY, timeZone);
    }
  } catch {
    // приватный режим
  }
  notify();
};

export const subscribeAppTimeZone = (listener: Listener): (() => void) => {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key != null && event.key !== TIMEZONE_STORAGE_KEY) return;
    cachedZone = undefined;
    notify();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
};

/** Крупные города вне России. Пояса России задаются отдельно в `PINNED_TIME_ZONES`. */
const WORLD_TIME_ZONES = [
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Warsaw',
  'Europe/Kyiv',
  'Europe/Istanbul',
  'Europe/Minsk',
  'Asia/Tbilisi',
  'Asia/Yerevan',
  'Asia/Baku',
  'Asia/Tashkent',
  'Asia/Almaty',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Seoul',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'Australia/Sydney',
  'UTC',
] as const;

const CITY_LABELS: Record<string, { ru: string; en: string }> = {
  'Europe/Kaliningrad': { ru: 'Калининград', en: 'Kaliningrad' },
  'Europe/Moscow': { ru: 'Москва', en: 'Moscow' },
  'Europe/Samara': { ru: 'Самара', en: 'Samara' },
  'Asia/Yekaterinburg': { ru: 'Екатеринбург', en: 'Yekaterinburg' },
  'Asia/Omsk': { ru: 'Омск', en: 'Omsk' },
  'Asia/Novosibirsk': { ru: 'Новосибирск', en: 'Novosibirsk' },
  'Asia/Krasnoyarsk': { ru: 'Красноярск', en: 'Krasnoyarsk' },
  'Asia/Irkutsk': { ru: 'Иркутск', en: 'Irkutsk' },
  'Asia/Yakutsk': { ru: 'Якутск', en: 'Yakutsk' },
  'Asia/Vladivostok': { ru: 'Владивосток', en: 'Vladivostok' },
  'Asia/Magadan': { ru: 'Магадан', en: 'Magadan' },
  'Asia/Kamchatka': { ru: 'Петропавловск-Камчатский', en: 'Petropavlovsk-Kamchatsky' },
  'Europe/London': { ru: 'Лондон', en: 'London' },
  'Europe/Berlin': { ru: 'Берлин', en: 'Berlin' },
  'Europe/Paris': { ru: 'Париж', en: 'Paris' },
  'Europe/Rome': { ru: 'Рим', en: 'Rome' },
  'Europe/Madrid': { ru: 'Мадрид', en: 'Madrid' },
  'Europe/Warsaw': { ru: 'Варшава', en: 'Warsaw' },
  'Europe/Kyiv': { ru: 'Киев', en: 'Kyiv' },
  'Europe/Istanbul': { ru: 'Стамбул', en: 'Istanbul' },
  'Europe/Minsk': { ru: 'Минск', en: 'Minsk' },
  'Asia/Tbilisi': { ru: 'Тбилиси', en: 'Tbilisi' },
  'Asia/Yerevan': { ru: 'Ереван', en: 'Yerevan' },
  'Asia/Baku': { ru: 'Баку', en: 'Baku' },
  'Asia/Tashkent': { ru: 'Ташкент', en: 'Tashkent' },
  'Asia/Almaty': { ru: 'Алматы', en: 'Almaty' },
  'Asia/Dubai': { ru: 'Дубай', en: 'Dubai' },
  'Asia/Kolkata': { ru: 'Калькутта', en: 'Kolkata' },
  'Asia/Bangkok': { ru: 'Бангкок', en: 'Bangkok' },
  'Asia/Singapore': { ru: 'Сингапур', en: 'Singapore' },
  'Asia/Shanghai': { ru: 'Шанхай', en: 'Shanghai' },
  'Asia/Hong_Kong': { ru: 'Гонконг', en: 'Hong Kong' },
  'Asia/Tokyo': { ru: 'Токио', en: 'Tokyo' },
  'Asia/Seoul': { ru: 'Сеул', en: 'Seoul' },
  'America/New_York': { ru: 'Нью-Йорк', en: 'New York' },
  'America/Chicago': { ru: 'Чикаго', en: 'Chicago' },
  'America/Los_Angeles': { ru: 'Лос-Анджелес', en: 'Los Angeles' },
  'America/Sao_Paulo': { ru: 'Сан-Паулу', en: 'Sao Paulo' },
  'America/Argentina/Buenos_Aires': { ru: 'Буэнос-Айрес', en: 'Buenos Aires' },
  'Australia/Sydney': { ru: 'Сидней', en: 'Sydney' },
  UTC: { ru: 'UTC', en: 'UTC' },
};

/** Пояса России и короткий список крупных городов. */
export const listAppTimeZones = (): readonly string[] =>
  [...PINNED_TIME_ZONES, ...WORLD_TIME_ZONES].filter(isValidTimeZone);

const GENERIC_NAME_SUFFIX =
  /, стандартное время$|, летнее время$| Standard Time$| Daylight Time$| Time$/;

/** Город или регион пояса на языке интерфейса: «Москва» / «Moscow». */
export const getTimeZoneCityLabel = (timeZone: string, locale = 'ru'): string => {
  const known = CITY_LABELS[timeZone];
  if (known != null) return locale.startsWith('en') ? known.en : known.ru;

  try {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: 'shortGeneric',
    }).formatToParts(new Date());
    const name = parts.find((part) => part.type === 'timeZoneName')?.value;
    if (name != null && !/^(GMT|UTC)/i.test(name)) {
      return name.replace(GENERIC_NAME_SUFFIX, '');
    }
  } catch {
    // пояс не поддержан
  }
  const city = timeZone.split('/').pop() ?? timeZone;
  return city.replace(/_/g, ' ');
};

export const getZonedParts = (instant: Date, timeZone: string): ZonedDateParts => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map: Record<string, string> = {};
  for (const part of formatter.formatToParts(instant)) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }
  let hour = Number(map.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
  };
};

/** Смещение пояса в минутах относительно UTC (UTC+3 → 180). */
export const getTimeZoneOffsetMinutes = (timeZone: string, instant: Date): number => {
  const parts = getZonedParts(instant, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return Math.round((asUtc - instant.getTime()) / 60_000);
};

export const formatTimeZoneOffset = (timeZone: string, instant: Date = new Date()): string => {
  const minutes = getTimeZoneOffsetMinutes(timeZone, instant);
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, '0');
  const mins = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${mins}`;
};

/** Смещение для списка поясов: `GMT+3`, `GMT-6`, `GMT+5:30`. */
export const formatGmtOffset = (timeZone: string, instant: Date = new Date()): string => {
  const minutes = getTimeZoneOffsetMinutes(timeZone, instant);
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (mins === 0) return `GMT${sign}${hours}`;
  return `GMT${sign}${hours}:${String(mins).padStart(2, '0')}`;
};

const toValidDate = (input: Date | string | number): Date =>
  input instanceof Date ? input : new Date(input);

/** Date, у которого локальные Y-M-D-h-m-s равны гражданскому времени `timeZone`. */
export const instantToWallClock = (
  input: Date | string | number,
  timeZone: string = getAppTimeZone(),
): Date => {
  const instant = toValidDate(input);
  if (Number.isNaN(instant.getTime())) return new Date(NaN);
  const parts = getZonedParts(instant, timeZone);
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    instant.getMilliseconds(),
  );
};

/** Текущий момент как настенное время выбранного пояса. */
export const getAppNow = (timeZone: string = getAppTimeZone()): Date =>
  instantToWallClock(new Date(), timeZone);

/**
 * Интерпретирует локальные поля `wall` как гражданское время `timeZone`
 * и возвращает соответствующий абсолютный момент.
 */
export const wallClockToInstant = (wall: Date, timeZone: string = getAppTimeZone()): Date => {
  if (Number.isNaN(wall.getTime())) return new Date(NaN);
  const utcGuess = Date.UTC(
    wall.getFullYear(),
    wall.getMonth(),
    wall.getDate(),
    wall.getHours(),
    wall.getMinutes(),
    wall.getSeconds(),
    wall.getMilliseconds(),
  );
  const offset1 = getTimeZoneOffsetMinutes(timeZone, new Date(utcGuess));
  let instantMs = utcGuess - offset1 * 60_000;
  const offset2 = getTimeZoneOffsetMinutes(timeZone, new Date(instantMs));
  if (offset2 !== offset1) {
    instantMs = utcGuess - offset2 * 60_000;
  }
  return new Date(instantMs);
};

/** ISO с offset выбранного пояса. Локальные поля Date не пересчитываются. */
export const formatWallClockISOString = (
  wall: Date,
  timeZone: string = getAppTimeZone(),
): string => {
  const pad = (value: number) => String(Math.abs(Math.trunc(value))).padStart(2, '0');
  const instant = wallClockToInstant(wall, timeZone);
  const offset = getTimeZoneOffsetMinutes(timeZone, instant);
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return (
    `${wall.getFullYear()}-${pad(wall.getMonth() + 1)}-${pad(wall.getDate())}` +
    `T${pad(wall.getHours())}:${pad(wall.getMinutes())}:${pad(wall.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
};

export const formatInAppTimeZone = (
  input: Date | string | number,
  options: Intl.DateTimeFormatOptions,
  locale?: string,
  timeZone: string = getAppTimeZone(),
): string => {
  const date = toValidDate(input);
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(date);
};

export const formatAppClock = (
  input: Date | string | number,
  timeZone: string = getAppTimeZone(),
): string => {
  const date = toValidDate(input);
  if (Number.isNaN(date.getTime())) return '';
  const parts = getZonedParts(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(parts.hour)}:${pad(parts.minute)}`;
};

/** Разница календарных дней `instant` и `now` в поясе приложения. Вчера → -1. */
export const getAppCalendarDayDiff = (
  instant: Date | string | number,
  now: Date = new Date(),
  timeZone: string = getAppTimeZone(),
): number => {
  const target = toValidDate(instant);
  const today = getZonedParts(now, timeZone);
  const day = getZonedParts(target, timeZone);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const dayUtc = Date.UTC(day.year, day.month - 1, day.day);
  return Math.round((dayUtc - todayUtc) / 86_400_000);
};

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** 0 = Пн … 6 = Вс в часовом поясе приложения. `date` — абсолютный момент. */
export const getAppWeekdayIndex = (date: Date, timeZone: string = getAppTimeZone()): number => {
  const label = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date);
  return WEEKDAY_INDEX[label] ?? 0;
};
