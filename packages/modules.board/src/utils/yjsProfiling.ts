/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Профилирование подключений HocuspocusProvider
 *
 * Все события подключения/отключения логируются в консоль.
 * Для просмотра итоговой статистики всех провайдеров выполните в консоли браузера:
 *
 *   window.__logYjsProviders()
 *
 * Это поможет выявить:
 * - Повторные переподключения
 * - Частые пересоздания провайдера
 * - Проблемы с зависимостями useMemo/useEffect
 */

export type ConnectionProfile = {
  instanceId: number;
  createdAt: number;
  connectCount: number;
  disconnectCount: number;
  statusChanges: Array<{ status: string; timestamp: number }>;
  syncedEvents: number;
  lastConnectTime?: number;
  lastDisconnectTime?: number;
  hasCalledConnect?: boolean; // Флаг для отслеживания вызова connect()
};

let providerInstanceCounter = 0;
const connectionProfiles = new Map<string, ConnectionProfile>();

/**
 * Логирует событие провайдера с детальной информацией
 */
export function logProviderEvent(
  instanceId: number,
  event: string,
  details?: Record<string, any>,
): void {
  const timestamp = Date.now();
  const profile = connectionProfiles.get(`instance-${instanceId}`);

  console.group(`🔌 [HocuspocusProvider #${instanceId}] ${event}`);
  console.log(`⏰ Время: ${new Date(timestamp).toLocaleTimeString()}`);
  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      console.log(`  ${key}:`, value);
    });
  }

  if (profile) {
    const lifetime = timestamp - profile.createdAt;
    console.log(`  📊 Статистика:`);
    console.log(`    - Время жизни: ${Math.round(lifetime / 1000)}с`);
    console.log(`    - Подключений: ${profile.connectCount}`);
    console.log(`    - Отключений: ${profile.disconnectCount}`);
    console.log(`    - Событий synced: ${profile.syncedEvents}`);
    console.log(`    - Изменений статуса: ${profile.statusChanges.length}`);

    // Предупреждение о множественных подключениях
    if (profile.connectCount > 1) {
      console.warn(`  ⚠️ ВНИМАНИЕ: Провайдер был подключен ${profile.connectCount} раз!`);
    }

    // Предупреждение о частых изменениях статуса
    if (profile.statusChanges.length > 5) {
      console.warn(
        `  ⚠️ ВНИМАНИЕ: Слишком много изменений статуса (${profile.statusChanges.length})!`,
      );
    }
  }
  console.groupEnd();
}

/**
 * Выводит итоговую статистику всех провайдеров
 */
export function logAllProvidersSummary(): void {
  console.group('📈 ИТОГОВАЯ СТАТИСТИКА ВСЕХ ПРОВАЙДЕРОВ');
  connectionProfiles.forEach((profile) => {
    const lifetime = Date.now() - profile.createdAt;
    console.log(`\n🔌 Провайдер #${profile.instanceId}:`);
    console.log(`  - Время жизни: ${Math.round(lifetime / 1000)}с`);
    console.log(`  - Подключений: ${profile.connectCount}`);
    console.log(`  - Отключений: ${profile.disconnectCount}`);
    console.log(`  - Событий synced: ${profile.syncedEvents}`);
    console.log(`  - Изменений статуса: ${profile.statusChanges.length}`);

    if (profile.connectCount > 1) {
      console.warn(`  ⚠️ ПРОБЛЕМА: Множественные подключения!`);
    }
  });
  console.log(`\n📊 Всего создано провайдеров: ${providerInstanceCounter}`);
  console.groupEnd();
}

/**
 * Создает новый экземпляр провайдера и возвращает его ID
 */
export function createProviderInstance(): number {
  return ++providerInstanceCounter;
}

/**
 * Получает или создает профиль для экземпляра провайдера
 */
export function getOrCreateProfile(instanceId: number): ConnectionProfile {
  const key = `instance-${instanceId}`;
  if (!connectionProfiles.has(key)) {
    connectionProfiles.set(key, {
      instanceId,
      createdAt: Date.now(),
      connectCount: 0,
      disconnectCount: 0,
      statusChanges: [],
      syncedEvents: 0,
      hasCalledConnect: false,
    });
  }
  return connectionProfiles.get(key)!;
}

/**
 * Получает профиль для экземпляра провайдера
 */
export function getProfile(instanceId: number): ConnectionProfile | undefined {
  return connectionProfiles.get(`instance-${instanceId}`);
}

/**
 * Обновляет профиль экземпляра провайдера
 */
export function updateProfile(instanceId: number, updates: Partial<ConnectionProfile>): void {
  const profile = getOrCreateProfile(instanceId);
  Object.assign(profile, updates);
}

// Экспортируем функцию для ручного вызова из консоли
if (typeof window !== 'undefined') {
  (window as any).__logYjsProviders = logAllProvidersSummary;
}
