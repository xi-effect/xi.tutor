import type { DrAsset } from '@ibodr/draw';
import { edgeBucket } from './rasterBudget';
import { getCachedBlobUrl, rememberBlob, resolveAssetUrl } from './resolveAssetUrl';

const MAX_PARALLEL_RESIZE = 2;

let running = 0;
const waiters: Array<() => void> = [];
const inflight = new Map<string, Promise<string>>();

function withResizeSlot<T>(job: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const start = () => {
      running += 1;
      job()
        .then(resolve, reject)
        .finally(() => {
          running -= 1;
          waiters.shift()?.();
        });
    };
    if (running < MAX_PARALLEL_RESIZE) start();
    else waiters.push(start);
  });
}

/** GIF и SVG нельзя растеризовать: пропадёт анимация или вектор. */
export function staticImagePixels(asset: DrAsset): { w: number; h: number } | null {
  if (asset.type !== 'image') return null;
  const mime = String(asset.props.mimeType ?? '');
  if (asset.props.isAnimated || /gif|svg/i.test(mime)) return null;
  const { w, h } = asset.props;
  if (!w || !h) return null;
  return { w, h };
}

async function resizeToBlob(blob: Blob, maxEdge: number): Promise<Blob | null> {
  if (typeof createImageBitmap !== 'function') return null;

  const source = await createImageBitmap(blob);
  let resized: ImageBitmap | null = null;
  try {
    const long = Math.max(source.width, source.height);
    if (long <= maxEdge) return null;

    const scale = maxEdge / long;
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    resized = await createImageBitmap(source, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'high',
    });
    source.close();

    if (typeof OffscreenCanvas === 'undefined') return null;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(resized, 0, 0, width, height);
    resized.close();
    resized = null;

    const keepLossless = blob.type === 'image/png' || blob.type === 'image/webp';
    const type = keepLossless ? blob.type : 'image/jpeg';
    return await canvas.convertToBlob({
      type,
      quality: type === 'image/jpeg' ? 0.92 : undefined,
    });
  } finally {
    source.close();
    resized?.close();
  }
}

async function buildDisplayUrl(cacheKey: string, originalUrl: string, maxEdge: number) {
  const cached = getCachedBlobUrl(cacheKey);
  if (cached) return cached;

  const response = await fetch(originalUrl);
  if (!response.ok) return originalUrl;
  const blob = await response.blob();
  const resized = await resizeToBlob(blob, maxEdge);
  if (!resized) return originalUrl;
  return rememberBlob(cacheKey, resized);
}

/**
 * URL картинки под экран. `maxEdge === null` — оригинал (экспорт, крупный зум).
 * Уменьшение идёт по очереди, чтобы несколько больших файлов не декодировались сразу.
 */
export async function resolveDisplayImageUrl(
  src: string,
  token: string,
  maxEdge: number | null,
): Promise<string> {
  const original = await resolveAssetUrl(src, token);
  if (!maxEdge || maxEdge < 32) return original;
  if (!original.startsWith('blob:')) return original;

  // Файлы на доске и так не больше 4096 px. Крупный запрос — это и есть оригинал.
  const bucket = edgeBucket(maxEdge);
  if (bucket >= 4096) return original;

  const cacheKey = `${src}@@${bucket}`;
  const cached = getCachedBlobUrl(cacheKey);
  if (cached) return cached;

  const pending = inflight.get(cacheKey);
  if (pending) return pending;

  const promise = withResizeSlot(() => buildDisplayUrl(cacheKey, original, bucket))
    .catch((error) => {
      console.error('[resolveDisplayImageUrl] resize failed:', error);
      return original;
    })
    .finally(() => {
      inflight.delete(cacheKey);
    });
  inflight.set(cacheKey, promise);
  return promise;
}
