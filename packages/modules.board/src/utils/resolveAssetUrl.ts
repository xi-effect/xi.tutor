import { getAxiosInstance } from 'common.config';
import { getFileUrl } from 'common.api';
import { getRegisteredTokens, unregisterToken } from './tokenRegistry';

function getAxiosStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const response = (err as { response?: { status?: number } }).response;
  return response?.status;
}

/** Успешно загруженные blob URL — живут до закрытия вкладки.
 *  Ключ — `src`: blob URL валиден независимо от того, каким токеном он был получен. */
const blobUrlCache = new Map<string, string>();

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

const FILE_URL_RE = /\/storage-service\/v2\/files\/([^/]+)\/?$/;

/**
 * Extracts the file ID from a legacy full URL
 * (e.g. `.../storage-service/v2/files/{id}/`).
 * Returns `null` if the URL doesn't match.
 */
export function extractFileIdFromUrl(src: string): string | null {
  if (!isFullUrl(src)) return null;
  const match = FILE_URL_RE.exec(src);
  return match?.[1] ?? null;
}

/**
 * Resolves a file `src` (either a file ID or a full URL for backward compatibility)
 * into a blob URL. Fetches with x-storage-token and caches the result.
 *
 * Optimisations:
 * - In-flight deduplication: concurrent calls for the same src share one request.
 * - Negative cache: failed src is blocked for NEGATIVE_CACHE_TTL_MS to prevent
 *   request storms when tldraw re-resolves assets on each viewport change.
 * - Limited fallback: at most MAX_FALLBACK_TOKENS alternative tokens are tried
 *   instead of iterating all 20 stored tokens.
 */
export async function resolveAssetUrl(src: string, token: string): Promise<string> {
  if (!src || !token) return src;

  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  const cached = blobUrlCache.get(src);
  if (cached) return cached;

  const primaryKey = makeCacheKey(src, token);

  const negExpiry = negativeCache.get(primaryKey);
  if (negExpiry !== undefined && Date.now() < negExpiry) {
    throw new Error(`[resolveAssetUrl] asset in negative cache: ${src}`);
  }

  const existing = inFlightCache.get(primaryKey);
  if (existing) return existing;

  const url = isFullUrl(src) ? src : getFileUrl(src);

  const promise = (async () => {
    try {
      return await fetchAndCacheBlobUrl(url, src, token);
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
      headers: { 'x-storage-token': token },
    });
  } catch (err) {
    // Сервер явно сказал, что этот x-storage-token мёртв — выбрасываем его из реестра,
    // чтобы все следующие картинки/PDF/аудио не пытались с ним стучаться.
    // 403 для нашего storage по факту всегда означает протухший / неверный токен.
    if (getAxiosStatus(err) === 403) {
      unregisterToken(token);
    }
    throw err;
  }

  if (response.status !== 200) throw new Error(`Unexpected status ${response.status}`);

  const blobUrl = URL.createObjectURL(response.data);
  blobUrlCache.set(cacheKey, blobUrl);
  return blobUrl;
}

export function getCachedBlobUrl(src: string): string | undefined {
  return blobUrlCache.get(src);
}

/** Конвертирует blob URL (или любой URL, доступный fetch'у) в data:URL (base64).
 *  Используется при copy для встраивания картинки прямо в clipboard,
 *  чтобы paste не зависел от токенов. */
async function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  if (!response.ok) throw new Error(`fetch(blobUrl) failed: ${response.status}`);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

/** Кэш data:URL для src — отдельный от blobUrlCache, потому что data:URL не зависит
 *  от документ-контекста и сериализуется в clipboard. */
const dataUrlCache = new Map<string, string>();

/** Получить data:URL для src — либо из кэша, либо скачать (используя blobUrlCache
 *  если он там есть, иначе пройти через обычный resolveAssetUrl). */
export async function resolveAssetAsDataUrl(src: string, token: string): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith('data:')) return src;

  const cachedData = dataUrlCache.get(src);
  if (cachedData) return cachedData;

  try {
    const blobUrl = await resolveAssetUrl(src, token);
    if (blobUrl.startsWith('data:')) return blobUrl;
    const dataUrl = await blobUrlToDataUrl(blobUrl);
    dataUrlCache.set(src, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

export function getCachedDataUrl(src: string): string | undefined {
  return dataUrlCache.get(src);
}
