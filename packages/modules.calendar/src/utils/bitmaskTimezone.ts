/**
 * Утилиты для конвертации битмаски дней недели между UTC и локальным часовым поясом пользователя.
 *
 * Контекст: сервер хранит `starts_at` и `weekly_starting_bitmask` в UTC.
 * Например, занятие в 9:00 вторника по Хабаровску (UTC+10) сохраняется
 * как 23:00 понедельника UTC. Бэкенд хранит битмаску тоже в UTC-координатах
 * (понедельник = бит 0), поэтому при отображении нужен сдвиг в локальный TZ.
 *
 * Кодировка битмаски: бит 0 = Пн, бит 1 = Вт, ..., бит 6 = Вс (7 битов).
 */

/** Индекс дня недели по UTC (0 = Пн, 6 = Вс) */
function getUtcWeekdayIndex(date: Date): number {
  const jsDay = date.getUTCDay(); // 0 = Вс, 1 = Пн, ..., 6 = Сб
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Индекс дня недели по локальному времени браузера (0 = Пн, 6 = Вс) */
function getLocalWeekdayIndex(date: Date): number {
  const jsDay = date.getDay(); // 0 = Вс, 1 = Пн, ..., 6 = Сб
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Циклический сдвиг 7-битной маски.
 *
 * weekdayShift > 0 — каждый бит переходит на день вперёд (Пн→Вт, Вс→Пн).
 * weekdayShift < 0 — каждый бит переходит на день назад (Вт→Пн, Пн→Вс).
 */
function cyclicShiftBitmask(bitmask: number, weekdayShift: number): number {
  const SIZE = 7;
  const s = ((weekdayShift % SIZE) + SIZE) % SIZE; // нормализуем в [0, 7)
  if (s === 0) return bitmask;
  const b = bitmask & 0x7f; // 7 битов
  // Бит N → бит (N + s) % 7: сдвиг вперёд = левый битовый сдвиг
  return ((b << s) | (b >> (SIZE - s))) & 0x7f;
}

/**
 * Вычисляет «смещение» между UTC-представлением и локальным временем
 * для даты `startsAt`.
 *
 * Возвращает d ∈ [-3, 3]:
 *  d < 0 — локальный TZ опережает UTC (UTC+N, N > 0); бит нужно сдвинуть вперёд
 *  d > 0 — локальный TZ отстаёт от UTC (UTC-N, N > 0); бит нужно сдвинуть назад
 *  d = 0 — смещения нет
 */
function computeWeekdayShiftUtcToLocal(date: Date): number {
  const a = getUtcWeekdayIndex(date);
  const b = getLocalWeekdayIndex(date);
  const SIZE = 7;
  const c = (((a - b) % SIZE) + SIZE) % SIZE; // [0, 7)
  return c > Math.floor(SIZE / 2) ? c - SIZE : c; // [-3, 3]
}

/**
 * Конвертирует UTC-битмаску в локальную для отображения в UI.
 *
 * Вызывать при рендере дней повторений из данных API (`weekly_starting_bitmask`),
 * чтобы пользователь видел правильные дни в своём часовом поясе.
 *
 * @param bitmask    Битмаска в UTC-координатах (бит 0 = Пн UTC).
 * @param startsAt   Дата начала серии — любой инстанс, достаточно для определения смещения TZ.
 */
export function bitmaskUtcToLocal(bitmask: number, startsAt: Date): number {
  const d = computeWeekdayShiftUtcToLocal(startsAt);
  if (d === 0) return bitmask;
  // d < 0 → сдвиг вперёд: -d > 0; d > 0 → сдвиг назад: -d < 0
  return cyclicShiftBitmask(bitmask, -d);
}

/**
 * Конвертирует локальную битмаску (введённую пользователем) в UTC для API.
 *
 * Инверсия `bitmaskUtcToLocal`.
 * Используйте, если нужно самостоятельно отправить корректную UTC-битмаску
 * (бэкенд при создании события сам делает эту конвертацию).
 *
 * @param bitmask    Битмаска в локальном часовом поясе (бит 0 = Пн local).
 * @param startsAt   Дата начала серии в UTC.
 */
export function bitmaskLocalToUtc(bitmask: number, startsAt: Date): number {
  const d = computeWeekdayShiftUtcToLocal(startsAt);
  if (d === 0) return bitmask;
  return cyclicShiftBitmask(bitmask, d);
}

/**
 * Конвертирует 7-битную маску в массив индексов дней недели (0 = Пн, 6 = Вс).
 *
 * Пример: 0b0000011 → [0, 1] (Пн + Вт).
 */
export function bitmaskToWeekdays(bitmask: number): number[] {
  const days: number[] = [];
  for (let i = 0; i < 7; i++) {
    if ((bitmask >> i) & 1) {
      days.push(i);
    }
  }
  return days;
}

/**
 * Конвертирует массив индексов дней (0 = Пн, 6 = Вс) в 7-битную маску.
 *
 * Пример: [0, 1] → 0b0000011 = 3.
 */
export function weekdaysToBitmask(days: number[]): number {
  return days.reduce((mask, day) => mask | (1 << day), 0);
}
