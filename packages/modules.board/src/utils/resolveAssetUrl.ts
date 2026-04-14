import { getAxiosInstance } from 'common.config';
import { getFileUrl } from 'common.api';
import { getRegisteredTokens } from './tokenRegistry';

const blobUrlCache = new Map<string, string>();

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
 * On failure, automatically tries all tokens from the registry (cross-board
 * fallback). This lets PDF/audio shapes resolve files from other boards
 * without any changes to their rendering code.
 */
export async function resolveAssetUrl(src: string, token: string): Promise<string> {
  if (!src || !token) return src;

  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  const cached = blobUrlCache.get(src);
  if (cached) return cached;

  const url = isFullUrl(src) ? src : getFileUrl(src);

  try {
    return await fetchAndCacheBlobUrl(url, src, token);
  } catch (primaryError) {
    for (const altToken of getRegisteredTokens()) {
      if (altToken === token) continue;
      try {
        return await fetchAndCacheBlobUrl(url, src, altToken);
      } catch {
        continue;
      }
    }
    throw primaryError;
  }
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
