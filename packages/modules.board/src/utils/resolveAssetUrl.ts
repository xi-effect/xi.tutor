import { getAxiosInstance } from 'common.config';

const blobUrlCache = new Map<string, string>();

/**
 * Fetches a protected file by URL with x-storage-token header,
 * creates a blob URL and caches it. Reusable for images, PDFs, etc.
 */
export async function resolveAssetUrl(src: string, token: string): Promise<string> {
  if (!src || !token) return src;

  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  const cached = blobUrlCache.get(src);
  if (cached) return cached;

  const axiosInst = await getAxiosInstance();
  const response = await axiosInst.get(src, {
    responseType: 'blob',
    headers: { 'x-storage-token': token },
  });

  if (response.status !== 200) return src;

  const blobUrl = URL.createObjectURL(response.data);
  blobUrlCache.set(src, blobUrl);
  return blobUrl;
}

export function getCachedBlobUrl(src: string): string | undefined {
  return blobUrlCache.get(src);
}
