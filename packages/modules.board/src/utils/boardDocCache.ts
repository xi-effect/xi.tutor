import { BOARD_SCHEMA_VERSION } from './yjsConstants';

const DB_NAME = 'xi-board-doc-cache';
const STORE_NAME = 'boards';
const DB_VERSION = 1;
const CACHE_FORMAT_VERSION = 1;

export const DESKTOP_MAX_BOARDS = 20;
export const DESKTOP_MAX_BYTES = 100 * 1024 * 1024;
export const MOBILE_MAX_BOARDS = 5;
export const MOBILE_MAX_BYTES = 25 * 1024 * 1024;

const CACHE_LOOKUP_TIMEOUT_MS = 500;

export type BoardDocCacheLimits = {
  maxBoards: number;
  maxBytes: number;
};

export type CachedBoardDoc = {
  key: string;
  userId: string;
  boardId: string;
  ydocId: string;
  yjsUpdate: Uint8Array;
  schemaVersion: string;
  formatVersion: number;
  cachedAt: number;
  lastAccessedAt: number;
  byteLength: number;
};

export type BoardDocCacheWrite = {
  userId: string;
  boardId: string;
  ydocId: string;
  yjsUpdate: Uint8Array;
  schemaVersion: string;
};

type CacheEntryMeta = {
  key: string;
  lastAccessedAt: number;
  byteLength: number;
};

export function makeBoardDocCacheKey(userId: string, boardId: string): string {
  return `${userId}::${boardId}`;
}

export function isCoarsePointerDevice(
  media: Pick<MediaQueryList, 'matches'> | null = typeof window === 'undefined'
    ? null
    : (window.matchMedia?.('(pointer: coarse)') ?? null),
  maxTouchPoints: number = typeof navigator === 'undefined' ? 0 : (navigator.maxTouchPoints ?? 0),
): boolean {
  return Boolean(media?.matches) && maxTouchPoints > 0;
}

export function getBoardDocCacheLimits(isMobile = isCoarsePointerDevice()): BoardDocCacheLimits {
  return isMobile
    ? { maxBoards: MOBILE_MAX_BOARDS, maxBytes: MOBILE_MAX_BYTES }
    : { maxBoards: DESKTOP_MAX_BOARDS, maxBytes: DESKTOP_MAX_BYTES };
}

/**
 * Какие ключи вытеснить, чтобы после записи `incoming` уложиться в N и в байты.
 * `keepKey` не вытесняем — это документ, который сейчас пишем.
 */
export function pickBoardDocsToEvict(
  entries: CacheEntryMeta[],
  incoming: { key: string; byteLength: number },
  limits: BoardDocCacheLimits,
): string[] {
  if (incoming.byteLength > limits.maxBytes) return [];

  const others = entries.filter((entry) => entry.key !== incoming.key);
  const sorted = [...others].sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

  let totalBytes = incoming.byteLength + others.reduce((sum, entry) => sum + entry.byteLength, 0);
  let totalBoards = others.length + 1;
  const evict: string[] = [];

  for (const entry of sorted) {
    if (totalBoards <= limits.maxBoards && totalBytes <= limits.maxBytes) break;
    evict.push(entry.key);
    totalBoards -= 1;
    totalBytes -= entry.byteLength;
  }

  return evict;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open board doc cache'));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = 'name' in error ? String(error.name) : '';
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED';
}

export async function getCachedBoardDoc(
  userId: string,
  boardId: string,
): Promise<CachedBoardDoc | null> {
  const key = makeBoardDocCacheKey(userId, boardId);

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const entry = (await requestToPromise(store.get(key))) as CachedBoardDoc | undefined;

    if (
      !entry?.yjsUpdate?.length ||
      entry.schemaVersion !== BOARD_SCHEMA_VERSION ||
      entry.formatVersion !== CACHE_FORMAT_VERSION
    ) {
      if (entry) store.delete(key);
      await waitForTransaction(tx);
      db.close();
      return null;
    }

    const touched: CachedBoardDoc = {
      ...entry,
      lastAccessedAt: Date.now(),
    };
    store.put(touched);
    await waitForTransaction(tx);
    db.close();
    return touched;
  } catch {
    return null;
  }
}

export function getCachedBoardDocWithTimeout(
  userId: string,
  boardId: string,
  timeoutMs = CACHE_LOOKUP_TIMEOUT_MS,
): Promise<CachedBoardDoc | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: CachedBoardDoc | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(null), timeoutMs);
    void getCachedBoardDoc(userId, boardId).then((doc) => {
      window.clearTimeout(timer);
      finish(doc);
    });
  });
}

export async function putCachedBoardDoc(input: BoardDocCacheWrite): Promise<void> {
  if (!input.userId || !input.boardId || !input.ydocId) return;
  if (input.schemaVersion !== BOARD_SCHEMA_VERSION) return;
  if (!input.yjsUpdate.length) return;

  const key = makeBoardDocCacheKey(input.userId, input.boardId);
  const now = Date.now();
  const record: CachedBoardDoc = {
    key,
    userId: input.userId,
    boardId: input.boardId,
    ydocId: input.ydocId,
    yjsUpdate: input.yjsUpdate,
    schemaVersion: input.schemaVersion,
    formatVersion: CACHE_FORMAT_VERSION,
    cachedAt: now,
    lastAccessedAt: now,
    byteLength: input.yjsUpdate.byteLength,
  };

  const limits = getBoardDocCacheLimits();
  if (record.byteLength > limits.maxBytes) return;

  try {
    await writeCachedBoardDoc(record, limits);
  } catch (error) {
    if (!isQuotaError(error)) return;

    try {
      await writeCachedBoardDoc(record, { maxBoards: 1, maxBytes: limits.maxBytes });
    } catch {
      // Safari / private mode / диск забит — кэш не обязателен
    }
  }
}

async function writeCachedBoardDoc(
  record: CachedBoardDoc,
  limits: BoardDocCacheLimits,
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const all = (await requestToPromise(store.getAll())) as CachedBoardDoc[];
  const userEntries = all.filter((entry) => entry.userId === record.userId);

  for (const key of pickBoardDocsToEvict(userEntries, record, limits)) {
    store.delete(key);
  }

  store.put(record);
  await waitForTransaction(tx);
  db.close();
}

export async function deleteCachedBoardDoc(userId: string, boardId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(makeBoardDocCacheKey(userId, boardId));
    await waitForTransaction(tx);
    db.close();
  } catch {
    // ignore
  }
}
