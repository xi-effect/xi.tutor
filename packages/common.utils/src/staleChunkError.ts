export const STALE_CHUNK_RELOAD_KEY = 'stale-chunk-reload-at';
export const STALE_CHUNK_RELOAD_COOLDOWN_MS = 15_000;

const STALE_CHUNK_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  /unable to preload css/i,
  /failed to load module script/i,
];

export type StaleChunkStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type ReloadOnceOnStaleChunkOptions = {
  now?: number;
  storage?: StaleChunkStorage | null;
  reload?: () => void;
  cooldownMs?: number;
};

let reloadScheduled = false;

export const isStaleChunkError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return STALE_CHUNK_PATTERNS.some((pattern) => pattern.test(message));
};

export const isStaleChunkReloadPending = (): boolean => reloadScheduled;

export const resetStaleChunkReloadState = (): void => {
  reloadScheduled = false;
};

const readStorage = (storage: StaleChunkStorage | null | undefined): StaleChunkStorage | null => {
  if (storage !== undefined) {
    return storage;
  }

  try {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage;
  } catch {
    return null;
  }
};

/**
 * Перезагружает страницу один раз, если после деплоя браузер тянет
 * уже удалённый Vite-чанк. Повтор в пределах cooldown блокируется,
 * чтобы не зациклить reload при битом деплое.
 */
export const reloadOnceOnStaleChunk = (
  error?: unknown,
  options: ReloadOnceOnStaleChunkOptions = {},
): boolean => {
  if (reloadScheduled) {
    return true;
  }

  if (error !== undefined && !isStaleChunkError(error)) {
    return false;
  }

  const storage = readStorage(options.storage);
  const now = options.now ?? Date.now();
  const cooldownMs = options.cooldownMs ?? STALE_CHUNK_RELOAD_COOLDOWN_MS;

  try {
    const lastReloadAt = Number(storage?.getItem(STALE_CHUNK_RELOAD_KEY) ?? 0);
    if (lastReloadAt > 0 && now - lastReloadAt < cooldownMs) {
      return false;
    }
    storage?.setItem(STALE_CHUNK_RELOAD_KEY, String(now));
  } catch {
    return false;
  }

  const reload = options.reload ?? (() => window.location.reload());
  reloadScheduled = true;
  reload();
  return true;
};
