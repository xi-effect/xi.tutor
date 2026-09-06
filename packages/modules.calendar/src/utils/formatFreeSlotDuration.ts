import type { TFunction } from 'i18next';

/** Длительность окна: «1 час 10 минут». */
export function formatFreeSlotDuration(start: Date, end: Date, t: TFunction): string {
  const totalMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(t('free_slot_hours', { count: hours }));
  }
  if (minutes > 0) {
    parts.push(t('free_slot_minutes', { count: minutes }));
  }
  if (parts.length === 0) {
    parts.push(t('free_slot_minutes', { count: 1 }));
  }

  return parts.join(' ');
}
