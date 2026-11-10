import type { DrAsset } from '@ibodr/draw';
import { edgeBucket } from './rasterBudget';
import { getCachedBlobUrl, rememberBlob, resolveAssetUrl } from './resolveAssetUrl';
import { reportBoardProblem } from './boardProblem';
import { isMemoryConstrainedDevice, maxDecodePixels } from './deviceBudget';
import { readImageSize } from './imageHeader';

/** На iPad одновременно декодируем один файл: пик памяти = один полноразмерный растр. */
const MAX_PARALLEL_RESIZE = isMemoryConstrainedDevice() ? 1 : 2;

/** Сколько решений «оставить оригинал» помним. Каждое — одна короткая строка. */
const KEEP_ORIGINAL_LIMIT = 500;

let running = 0;
const waiters: Array<() => void> = [];
const inflight = new Map<string, Promise<string>>();
/**
 * Ключи, для которых уменьшать нечего или не получилось.
 * Без этой памяти каждый резолв (размонтирование за экраном, смена зума, второй экземпляр)
 * заново качал и целиком декодировал файл только ради того, чтобы снова отказаться от ресайза.
 */
const keepOriginal = new Set<string>();

function rememberKeepOriginal(key: string) {
  keepOriginal.add(key);
  if (keepOriginal.size > KEEP_ORIGINAL_LIMIT) {
    const oldest = keepOriginal.values().next().value;
    if (oldest !== undefined) keepOriginal.delete(oldest);
  }
}

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

export type ImagePixelsHint = { w: number; h: number };

function targetSize(w: number, h: number, maxEdge: number) {
  const scale = maxEdge / Math.max(w, h);
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

/**
 * Уменьшает blob до `maxEdge` по длинной стороне. `null` — уменьшать не нужно.
 * С `hint` (размеры из ассета) декодируем сразу в целевой размер, не держа в памяти
 * полноразмерный растр рядом с уменьшенным.
 */
async function resizeToBlob(
  blob: Blob,
  maxEdge: number,
  hint?: ImagePixelsHint,
): Promise<Blob | null> {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
    return null;
  }

  // Заголовок файла говорит, сколько в нём пикселей, ещё до декодирования. Число пикселей
  // не зависит от EXIF-поворота, поэтому годится для решения «можно ли декодировать».
  // А вот ширину и высоту из заголовка брать нельзя: у повёрнутого JPEG они поменяны местами.
  const header = await readImageSize(blob);
  const guard = header ?? hint ?? null;
  if (guard) {
    // Огромный растр (скриншот длинной страницы на 80+ Мп) целиком в память не берём:
    // на iPhone это сотни МБ за один вызов и падение вкладки. `<img>` покажет оригинал сам.
    if (guard.w * guard.h > maxDecodePixels()) return null;
  } else if (isMemoryConstrainedDevice()) {
    // Размер неизвестен, безопасность декодирования не доказана.
    return null;
  }
  // Размеры после поворота знает только ассет (их записал createImageBitmap при вставке).
  const dims = hint ?? null;

  let source: ImageBitmap | null = null;
  let resized: ImageBitmap | null = null;
  try {
    let width: number;
    let height: number;
    if (dims) {
      if (Math.max(dims.w, dims.h) <= maxEdge) return null;
      ({ width, height } = targetSize(dims.w, dims.h, maxEdge));
    } else {
      source = await createImageBitmap(blob);
      if (Math.max(source.width, source.height) <= maxEdge) return null;
      ({ width, height } = targetSize(source.width, source.height, maxEdge));
    }

    resized = await createImageBitmap(source ?? blob, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'high',
    });
    source?.close();
    source = null;

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(resized, 0, 0, width, height);
    resized.close();
    resized = null;

    const keepLossless = blob.type === 'image/png' || blob.type === 'image/webp';
    const type = keepLossless ? blob.type : 'image/jpeg';
    const result = await canvas.convertToBlob({
      type,
      quality: type === 'image/jpeg' ? 0.92 : undefined,
    });
    // Освобождаем backing store сразу, Safari сам делает это поздно.
    canvas.width = 0;
    canvas.height = 0;
    return result;
  } finally {
    source?.close();
    resized?.close();
  }
}

async function buildDisplayUrl(
  cacheKey: string,
  originalUrl: string,
  maxEdge: number,
  hint?: ImagePixelsHint,
) {
  const cached = getCachedBlobUrl(cacheKey);
  if (cached) return cached;

  const response = await fetch(originalUrl);
  if (!response.ok) return originalUrl;
  const blob = await response.blob();
  const resized = await resizeToBlob(blob, maxEdge, hint);
  if (!resized) {
    rememberKeepOriginal(cacheKey);
    return originalUrl;
  }
  // Уменьшенная копия больше оригинала бессмысленна (перекодированный PNG).
  if (resized.size >= blob.size) {
    rememberKeepOriginal(cacheKey);
    return originalUrl;
  }
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
  hint?: ImagePixelsHint,
): Promise<string> {
  const original = await resolveAssetUrl(src, token);
  if (!maxEdge || maxEdge < 32) return original;
  if (!original.startsWith('blob:')) return original;

  // Файлы на доске и так не больше 4096 px. Крупный запрос — это и есть оригинал.
  const bucket = edgeBucket(maxEdge);
  if (bucket >= 4096) return original;

  // Известные размеры: файл не крупнее корзины — уменьшать нечего, даже не качаем.
  if (hint && Math.max(hint.w, hint.h) <= bucket) return original;
  // Огромный файл не декодируем ради ресайза, даже не скачиваем его повторно.
  if (hint && hint.w * hint.h > maxDecodePixels()) return original;

  const cacheKey = `${src}@@${bucket}`;
  const cached = getCachedBlobUrl(cacheKey);
  if (cached) return cached;
  if (keepOriginal.has(cacheKey)) return original;

  const pending = inflight.get(cacheKey);
  if (pending) return pending;

  const promise = withResizeSlot(() => buildDisplayUrl(cacheKey, original, bucket, hint))
    .catch((error) => {
      // Падение ресайза не повторяем на каждом резолве: оставляем оригинал.
      rememberKeepOriginal(cacheKey);
      reportBoardProblem('image-display', error);
      return original;
    })
    .finally(() => {
      inflight.delete(cacheKey);
    });
  inflight.set(cacheKey, promise);
  return promise;
}
