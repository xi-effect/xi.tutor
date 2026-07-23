const STORAGE_KEY = 'activation_flow_id';
const META_KEY = 'activation_flow_meta';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

type ActivationFlowMeta = {
  createdAt: number;
};

function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function readMeta(): ActivationFlowMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActivationFlowMeta;
    if (typeof parsed?.createdAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function isExpired(meta: ActivationFlowMeta | null): boolean {
  if (!meta) return true;
  return Date.now() - meta.createdAt > TTL_MS;
}

function persist(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
    localStorage.setItem(
      META_KEY,
      JSON.stringify({ createdAt: Date.now() } satisfies ActivationFlowMeta),
    );
  } catch {
    // localStorage может быть недоступен — продолжаем с in-memory значением в рамках сессии.
  }
}

let memoryFlowId: string | null = null;

/**
 * Возвращает стабильный activation_flow_id (UUID) со сроком жизни 30 дней.
 * Создаётся при первом обращении (обычно — открытие формы регистрации).
 */
export function getOrCreateActivationFlowId(): string {
  if (typeof window === 'undefined') {
    return memoryFlowId ?? createUuid();
  }

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const meta = readMeta();

    if (existing && !isExpired(meta)) {
      memoryFlowId = existing;
      return existing;
    }
  } catch {
    if (memoryFlowId) return memoryFlowId;
  }

  const id = createUuid();
  memoryFlowId = id;
  persist(id);
  return id;
}

/** Текущий ID без создания нового. */
export function getActivationFlowId(): string | undefined {
  if (memoryFlowId) return memoryFlowId;

  if (typeof window === 'undefined') return undefined;

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const meta = readMeta();
    if (existing && !isExpired(meta)) {
      memoryFlowId = existing;
      return existing;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

/** Сбросить flow (например, после активации / регистрации другого аккаунта). */
export function resetActivationFlowId(): string {
  const id = createUuid();
  memoryFlowId = id;
  if (typeof window !== 'undefined') {
    persist(id);
  }
  return id;
}
