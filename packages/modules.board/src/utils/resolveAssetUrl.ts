import { getAxiosInstance } from 'common.config';
import { getFileUrl } from 'common.api';
import { getRegisteredTokens } from './tokenRegistry';

/** Успешно загруженные blob URL — живут до закрытия вкладки */
const blobUrlCache = new Map<string, string>();

/**
 * In-flight дедупликация: если для данного src уже идёт запрос,
 * повторные вызовы получают тот же Promise и не создают новых HTTP-запросов.
 */
const inFlightCache = new Map<string, Promise<string>>();

/**
 * Негативный кэш: src → время истечения блокировки (ms).
 * Если все попытки загрузки (включая fallback-токены) провалились,
 * мы не повторяем запросы до истечения TTL.
 */
const negativeCache = new Map<string, number>();
const NEGATIVE_CACHE_TTL_MS = 30_000;

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

  const negExpiry = negativeCache.get(src);
  if (negExpiry !== undefined && Date.now() < negExpiry) {
    throw new Error(`[resolveAssetUrl] asset in negative cache: ${src}`);
  }

  const existing = inFlightCache.get(src);
  if (existing) return existing;

  const url = isFullUrl(src) ? src : getFileUrl(src);

  const promise = (async () => {
    try {
      return await fetchAndCacheBlobUrl(url, src, token);
    } catch (primaryError) {
      const fallbackTokens = getRegisteredTokens()
        .filter((t) => t !== token)
        .slice(0, MAX_FALLBACK_TOKENS);

      for (const altToken of fallbackTokens) {
        try {
          return await fetchAndCacheBlobUrl(url, src, altToken);
        } catch {
          continue;
        }
      }

      negativeCache.set(src, Date.now() + NEGATIVE_CACHE_TTL_MS);
      throw primaryError;
    } finally {
      inFlightCache.delete(src);
    }
  })();

  inFlightCache.set(src, promise);
  return promise;
}

async function fetchAndCacheBlobUrl(url: string, cacheKey: string, token: string): Promise<string> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst.get(url, {
    responseType: 'blob',
    headers: { 'x-storage-token': token },
  });

  if (response.status !== 200) throw new Error(`Unexpected status ${response.status}`);

  const blobUrl = URL.createObjectURL(response.data);
  blobUrlCache.set(cacheKey, blobUrl);
  return blobUrl;
}

export function getCachedBlobUrl(src: string): string | undefined {
  return blobUrlCache.get(src);
}
