import { toLocalISOString } from './dateTimezone';

/**
 * ISO `starts_at` для API планировщика: как в ответе расписания (с offset),
 * а не UTC-Z через `Date.prototype.toISOString()`.
 */
export function resolveSchedulerStartsAt(
  startsAt: string | null | undefined,
  fallbackDate: Date,
): string {
  const raw = startsAt?.trim();
  if (raw != null && raw.length > 0) {
    const d = new Date(raw);
    if (Number.isFinite(d.getTime())) return raw;
  }
  return toLocalISOString(fallbackDate);
}
