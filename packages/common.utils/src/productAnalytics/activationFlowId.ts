const SESSION_ID_KEY = 'activation_flow_id';
const SESSION_META_KEY = 'activation_flow_meta';
const USER_FLOW_PREFIX = 'activation_flow_user:';
const FLOW_RECORD_PREFIX = 'activation_flow_record:';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

type ActivationFlowStatus = 'in_progress' | 'completed';

type ActivationFlowMeta = {
  createdAt: number;
  status: ActivationFlowStatus;
  boundUserId?: string;
};

type StoredFlow = {
  id: string;
  meta: ActivationFlowMeta;
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

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined';
}

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isExpired(meta: ActivationFlowMeta | null): boolean {
  if (!meta || typeof meta.createdAt !== 'number') return true;
  return Date.now() - meta.createdAt > TTL_MS;
}

function isMeta(value: ActivationFlowMeta | null): value is ActivationFlowMeta {
  return (
    !!value &&
    typeof value.createdAt === 'number' &&
    (value.status === 'in_progress' || value.status === 'completed')
  );
}

function readSessionFlow(): StoredFlow | null {
  if (!canUseBrowserStorage()) return null;

  try {
    const id = window.sessionStorage.getItem(SESSION_ID_KEY);
    const meta = readJson<ActivationFlowMeta>(window.sessionStorage, SESSION_META_KEY);
    if (!id || !isMeta(meta) || isExpired(meta)) return null;
    return { id, meta };
  } catch {
    return null;
  }
}

function writeSessionFlow(id: string, meta: ActivationFlowMeta): void {
  if (!canUseBrowserStorage()) return;

  try {
    window.sessionStorage.setItem(SESSION_ID_KEY, id);
    window.sessionStorage.setItem(SESSION_META_KEY, JSON.stringify(meta));
  } catch {
    // sessionStorage может быть недоступен — остаётся in-memory id вкладки.
  }
}

function writeFlowRecord(id: string, meta: ActivationFlowMeta): void {
  if (!canUseBrowserStorage()) return;

  try {
    window.localStorage.setItem(`${FLOW_RECORD_PREFIX}${id}`, JSON.stringify(meta));
    if (meta.boundUserId) {
      window.localStorage.setItem(`${USER_FLOW_PREFIX}${meta.boundUserId}`, id);
    }
  } catch {
    // ignore
  }
}

function readFlowRecord(id: string): ActivationFlowMeta | null {
  if (!canUseBrowserStorage()) return null;

  try {
    const meta = readJson<ActivationFlowMeta>(window.localStorage, `${FLOW_RECORD_PREFIX}${id}`);
    if (!isMeta(meta) || isExpired(meta)) return null;
    return meta;
  } catch {
    return null;
  }
}

function readUserFlow(userId: string): StoredFlow | null {
  if (!canUseBrowserStorage()) return null;

  try {
    const id = window.localStorage.getItem(`${USER_FLOW_PREFIX}${userId}`);
    if (!id) return null;
    const meta = readFlowRecord(id);
    if (!meta || meta.boundUserId !== userId) return null;
    return { id, meta };
  } catch {
    return null;
  }
}

let memoryFlowId: string | null = null;
let memoryMeta: ActivationFlowMeta | null = null;
let currentAnalyticsUserId: string | null = null;

function remember(id: string, meta: ActivationFlowMeta): void {
  memoryFlowId = id;
  memoryMeta = meta;
}

function bindFlow(id: string, meta: ActivationFlowMeta, userId: string): string {
  const completed: ActivationFlowMeta = {
    ...meta,
    status: 'completed',
    boundUserId: userId,
  };
  remember(id, completed);
  currentAnalyticsUserId = userId;
  writeSessionFlow(id, completed);
  writeFlowRecord(id, completed);
  return id;
}

function mintCompletedFlow(userId: string): string {
  const id = createUuid();
  const meta: ActivationFlowMeta = {
    createdAt: Date.now(),
    status: 'completed',
    boundUserId: userId,
  };
  return bindFlow(id, meta, userId);
}

/**
 * Начало signup в этой вкладке.
 * In-progress id живёт в sessionStorage и не берётся из чужого localStorage.
 * Завершённый flow не переиспользуется.
 */
export function beginSignupActivationFlow(): string {
  const session = readSessionFlow();
  if (session?.meta.status === 'in_progress') {
    remember(session.id, session.meta);
    return session.id;
  }

  const id = createUuid();
  const meta: ActivationFlowMeta = {
    createdAt: Date.now(),
    status: 'in_progress',
  };
  remember(id, meta);
  writeSessionFlow(id, meta);
  return id;
}

/**
 * Старт или продолжение signup-попытки в этой вкладке.
 * После auth_signup_succeeded тот же вызов создаёт новый UUID.
 */
export function getOrCreateActivationFlowId(): string {
  return beginSignupActivationFlow();
}

/**
 * Привязывает текущую попытку к user_id после успешной регистрации.
 * Уже завершённый flow другого пользователя не перезаписывается: для нового
 * user_id создаётся отдельный UUID.
 */
export function completeActivationFlow(userId: string | number): string {
  const user = String(userId);
  const session = readSessionFlow();
  const owner = session
    ? (readFlowRecord(session.id)?.boundUserId ?? session.meta.boundUserId)
    : undefined;

  if (session && owner === user) {
    return bindFlow(session.id, session.meta, user);
  }

  if (session?.meta.status === 'in_progress' && !owner) {
    return bindFlow(session.id, session.meta, user);
  }

  return mintCompletedFlow(user);
}

/**
 * Текущий пользователь аналитики. Вызывается из identify и logout.
 * Flow, привязанный к другому user_id, в события не подмешивается.
 */
export function setActivationAnalyticsUser(userId: string | number | null): void {
  if (userId == null) {
    currentAnalyticsUserId = null;
    const session = readSessionFlow();
    if (session?.meta.status === 'in_progress') {
      remember(session.id, session.meta);
      return;
    }
    memoryFlowId = null;
    memoryMeta = null;
    return;
  }

  currentAnalyticsUserId = String(userId);
  const bound = readUserFlow(currentAnalyticsUserId);
  if (bound) {
    remember(bound.id, bound.meta);
  }
}

/**
 * Текущий id без создания нового.
 * Незавершённая попытка этой вкладки важнее старой привязки.
 * Завершённый flow отдаётся только текущему analytics user.
 */
export function getActivationFlowId(): string | undefined {
  const session = readSessionFlow();
  if (session?.meta.status === 'in_progress') return session.id;

  if (currentAnalyticsUserId) {
    return readUserFlow(currentAnalyticsUserId)?.id;
  }

  if (memoryFlowId && memoryMeta?.status === 'in_progress' && !memoryMeta.boundUserId) {
    return memoryFlowId;
  }

  return undefined;
}

/** Новая signup-попытка в этой вкладке. Привязки завершённых flow не стирает. */
export function resetActivationFlowId(): string {
  memoryFlowId = null;
  memoryMeta = null;
  if (canUseBrowserStorage()) {
    try {
      window.sessionStorage.removeItem(SESSION_ID_KEY);
      window.sessionStorage.removeItem(SESSION_META_KEY);
    } catch {
      // ignore
    }
  }
  return beginSignupActivationFlow();
}

/** Сброс памяти модуля между тестами. */
export function resetActivationFlowMemory(): void {
  memoryFlowId = null;
  memoryMeta = null;
  currentAnalyticsUserId = null;
}
