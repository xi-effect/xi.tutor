import type { ScheduleItem } from 'common.services';

/**
 * Стабильный ключ элемента расписания (React key, сопоставление строк).
 * Для персистентного инстанса — id из API; для virtual — составной ключ.
 */
export function getScheduleItemRowKey(item: ScheduleItem): string {
  const instance = item.eventInstance;
  if ('id' in instance) {
    return instance.id;
  }
  return `${item.eventId}:${item.instanceKind}:${item.instanceIndex ?? 'unknown'}:${item.startsAt}`;
}
