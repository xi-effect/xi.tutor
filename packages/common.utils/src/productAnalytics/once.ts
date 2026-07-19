const sentKeys = new Set<string>();

/**
 * Отправляет действие один раз за время жизни вкладки (защита от Strict Mode / ререндеров).
 * Возвращает true, если действие выполнено впервые.
 */
export function trackOnce(key: string, track: () => void): boolean {
  if (sentKeys.has(key)) return false;
  sentKeys.add(key);
  track();
  return true;
}

/** Для тестов: сбросить in-memory once-ключи. */
export function resetTrackOnceKeys(): void {
  sentKeys.clear();
}
