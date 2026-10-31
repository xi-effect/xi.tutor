/**
 * Рантайм-резолв файлов для отображения на доске.
 * Персист хранит только file id — контракт в ./storedFileSrc.ts.
 */
import { getAxiosInstance } from 'common.config';
import { getFileUrl } from 'common.api';
import { pickBlobKeysToEvict } from './blobBudget';
import { blobToDataUrl } from './blobToDataUrl';
import { getRegisteredTokens, unregisterToken } from './tokenRegistry';

function getAxiosStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const response = (err as { response?: { status?: number } }).response;
  return response?.status;
}

type BlobSlot = {
  url: string;
  bytes: number;
  touched: number;
};

/**
 * Сжатые файлы доски. Ключ — `src` или `src@@размер` для уменьшенной копии.
 * URL живёт, пока его показывает фигура (`retainBlobUrl`) или пока кэш в бюджете.
 */
const blobSlots = new Map<string, BlobSlot>();
const blobPins = new Map<string, number>();

const DATA_URL_CACHE_LIMIT = 12;

function evictBlobSlots() {
  const pinned = new Set(blobPins.keys());
  const keys = pickBlobKeysToEvict(
    [...blobSlots.entries()].map(([key, slot]) => ({ key, ...slot })),
    pinned,
    Date.now(),
  );
  for (const key of keys) {
    const slot = blobSlots.get(key);
    if (!slot || blobPins.has(slot.url)) continue;
    URL.revokeObjectURL(slot.url);
    blobSlots.delete(key);
  }
}

/** Фигура держит URL, пока он стоит в `<img>`, `<canvas>` или `<audio>`. */
export function retainBlobUrl(url: string | null | undefined): () => void {
  if (!url?.startsWith('blob:')) return () => {};
  blobPins.set(url, (blobPins.get(url) ?? 0) + 1);
  return () => {
    const next = (blobPins.get(url) ?? 1) - 1;
    if (next <= 0) blobPins.delete(url);
    else blobPins.set(url, next);
    evictBlobSlots();
  };
}

/** Кладёт blob в общий бюджет. Повтор того же ключа возвращает уже созданный URL. */
export function rememberBlob(key: string, blob: Blob): string {
  const existing = blobSlots.get(key);
  if (existing) {
    existing.touched = Date.now();
    return existing.url;
  }
  const url = URL.createObjectURL(blob);
  blobSlots.set(key, { url, bytes: blob.size, touched: Date.now() });
  evictBlobSlots();
  return url;
}

function readBlob(key: string): string | undefined {
  const slot = blobSlots.get(key);
  if (!slot) return undefined;
  slot.touched = Date.now();
  return slot.url;
}

/**
 * In-flight дедупликация: если для пары `src + token` уже идёт запрос,
 * повторные вызовы получают тот же Promise и не создают новых HTTP-запросов.
 *
 * Ключ ОБЯЗАТЕЛЬНО включает токен, иначе при cross-board paste
 * (resolveAssetUrl(src, sourceToken) идёт параллельно с resolveAssetUrl(src, currentToken))
 * один из вызовов получит чужой результат — и paste для изображений сломается.
 */
const inFlightCache = new Map<string, Promise<string>>();

/**
 * Негативный кэш: `src::token` → время истечения блокировки (ms).
 * Если конкретный токен не смог загрузить файл, мы не повторяем запросы
 * с этим токеном в течение TTL. Но другой токен (например, `meta.sourceToken`
 * из буфера обмена) всё ещё может попробовать.
 */
const negativeCache = new Map<string, number>();
const NEGATIVE_CACHE_TTL_MS = 30_000;

function makeCacheKey(src: string, token: string): string {
  return `${src}::${token}`;
}

/**
 * Сколько чужих (fallback) токенов из реестра пробуем при ошибке.
 * Ограничиваем, чтобы одна битая картинка не порождала 20 лишних запросов.
 */
const MAX_FALLBACK_TOKENS = 3;

function isFullUrl(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://');
}

const FILE_URL_RE = /\/(?:storage-service\/v2|content-service)\/files\/([^/]+)\/?$/;

/**
 * Extracts the file ID from a full URL
 * (`.../content-service/files/{id}/` or legacy `.../storage-service/v2/files/{id}/`).
 * Returns `null` if the URL doesn't match.
 */
export function extractFileIdFromUrl(src: string): string | null {
  if (!isFullUrl(src)) return null;
  const match = FILE_URL_RE.exec(src);
  return match?.[1] ?? null;
}

/**
 * Resolves a file `src` (storage file id, or legacy full URL) into a blob URL.
 * Fetches with x-content-token and caches the result.
 *
 * Optimisations:
 * - In-flight deduplication: concurrent calls for the same src share one request.
 * - Negative cache: failed src is blocked for NEGATIVE_CACHE_TTL_MS to prevent
 *   request storms when tldraw re-resolves assets on each viewport change.
 * - Limited fallback: at most MAX_FALLBACK_TOKENS alternative tokens are tried
 *   instead of iterating all 20 stored tokens.
 */
export type ResolveAssetUrlOptions = {
  /** Повторить запрос, даже если src недавно упал в negative cache. */
  ignoreNegativeCache?: boolean;
};

export async function resolveAssetUrl(
  src: string,
  token: string,
  options?: ResolveAssetUrlOptions,
): Promise<string> {
  if (!src || !token) return src;

  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  const cached = readBlob(src);
  if (cached) return cached;

  const primaryKey = makeCacheKey(src, token);

  if (!options?.ignoreNegativeCache) {
    const negExpiry = negativeCache.get(primaryKey);
    if (negExpiry !== undefined && Date.now() < negExpiry) {
      throw new Error(`[resolveAssetUrl] asset in negative cache: ${src}`);
    }
  } else {
    negativeCache.delete(primaryKey);
  }

  const existing = inFlightCache.get(primaryKey);
  if (existing) return existing;

  const url = isFullUrl(src) ? src : getFileUrl(src);

  const promise = (async () => {
    try {
      const blobUrl = await fetchAndCacheBlobUrl(url, src, token);
      negativeCache.delete(primaryKey);
      return blobUrl;
    } catch (primaryError) {
      negativeCache.set(primaryKey, Date.now() + NEGATIVE_CACHE_TTL_MS);

      const fallbackTokens = getRegisteredTokens()
        .filter((t) => t !== token)
        .slice(0, MAX_FALLBACK_TOKENS);

      for (const altToken of fallbackTokens) {
        const altKey = makeCacheKey(src, altToken);
        const altNegExpiry = negativeCache.get(altKey);
        if (altNegExpiry !== undefined && Date.now() < altNegExpiry) continue;

        try {
          return await fetchAndCacheBlobUrl(url, src, altToken);
        } catch {
          negativeCache.set(altKey, Date.now() + NEGATIVE_CACHE_TTL_MS);
          continue;
        }
      }

      throw primaryError;
    } finally {
      inFlightCache.delete(primaryKey);
    }
  })();

  inFlightCache.set(primaryKey, promise);
  return promise;
}

async function fetchAndCacheBlobUrl(url: string, cacheKey: string, token: string): Promise<string> {
  const axiosInst = await getAxiosInstance();

  let response;
  try {
    response = await axiosInst.get(url, {
      responseType: 'blob',
      headers: { 'x-content-token': token },
    });
  } catch (err) {
    // Сервер явно сказал, что этот x-content-token мёртв — выбрасываем его из реестра,
    // чтобы все следующие картинки/PDF/аудио не пытались с ним стучаться.
    // 403 для нашего storage по факту всегда означает протухший / неверный токен.
    if (getAxiosStatus(err) === 403) {
      unregisterToken(token);
    }
    throw err;
  }

  if (response.status !== 200) throw new Error(`Unexpected status ${response.status}`);

  return rememberBlob(cacheKey, response.data as Blob);
}

export function getCachedBlobUrl(src: string): string | undefined {
  return readBlob(src);
}

/** Конвертирует blob URL (или любой URL, доступный fetch'у) в data:URL (base64).
 *  Используется при copy для встраивания картинки прямо в clipboard,
 *  чтобы paste не зависел от токенов. */
async function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  if (!response.ok) throw new Error(`fetch(blobUrl) failed: ${response.status}`);
  const blob = await response.blob();
  return blobToDataUrl(blob);
}

/** Кэш data:URL для src — отдельный от blob-кэша: data:URL не зависит от документа
 *  и сериализуется в clipboard. Держим только последние копии. */
const dataUrlCache = new Map<string, string>();

function rememberDataUrl(src: string, dataUrl: string) {
  if (dataUrlCache.has(src)) dataUrlCache.delete(src);
  dataUrlCache.set(src, dataUrl);
  while (dataUrlCache.size > DATA_URL_CACHE_LIMIT) {
    const oldest = dataUrlCache.keys().next().value;
    if (oldest === undefined) break;
    dataUrlCache.delete(oldest);
  }
}

/** Получить data:URL для src — либо из кэша, либо скачать (используя blobUrlCache
 *  если он там есть, иначе пройти через обычный resolveAssetUrl). */
export async function resolveAssetAsDataUrl(src: string, token: string): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith('data:')) return src;

  const cachedData = dataUrlCache.get(src);
  if (cachedData) {
    rememberDataUrl(src, cachedData);
    return cachedData;
  }

  try {
    const blobUrl = await resolveAssetUrl(src, token);
    if (blobUrl.startsWith('data:')) return blobUrl;
    const dataUrl = await blobUrlToDataUrl(blobUrl);
    rememberDataUrl(src, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

export function getCachedDataUrl(src: string): string | undefined {
  return dataUrlCache.get(src);
}

const ASSET_READY_RETRY_MS = [0, 300, 800, 1600] as const;

/**
 * Ждёт, пока только что загруженный файл станет доступен в storage.
 * Сразу после upload первый GET часто 404 — без ретрая картинка «не с первого раза».
 */
export async function waitForResolvedAssetUrl(src: string, token: string): Promise<string | null> {
  if (!src || !token) return null;
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  for (const delay of ASSET_READY_RETRY_MS) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const url = await resolveAssetUrl(src, token, { ignoreNegativeCache: true });
      if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http')) {
        return url;
      }
    } catch {
      // файл ещё не готов или токен не подошёл — пробуем снова
    }
  }

  return null;
}
