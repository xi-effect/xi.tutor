/** Сжатые файлы доски. Декодированные растры живут отдельно и ограничены сильнее. */
export const BLOB_CACHE_BUDGET_BYTES = 128 * 1024 * 1024;

/** Свежий blob не выкидываем: его могут читать вставка, экспорт или только что открытый файл. */
export const BLOB_CACHE_MIN_AGE_MS = 3 * 60 * 1000;

export type BlobCacheEntry = {
  key: string;
  url: string;
  bytes: number;
  touched: number;
};

/**
 * Какие несжатые копии можно отпустить.
 * Закреплённый URL (его прямо сейчас показывает фигура) не трогаем.
 */
export function pickBlobKeysToEvict(
  entries: BlobCacheEntry[],
  pinnedUrls: ReadonlySet<string>,
  now: number,
  budgetBytes = BLOB_CACHE_BUDGET_BYTES,
  minAgeMs = BLOB_CACHE_MIN_AGE_MS,
): string[] {
  let total = 0;
  for (const entry of entries) total += entry.bytes;
  if (total <= budgetBytes) return [];

  const candidates = entries
    .filter((entry) => !pinnedUrls.has(entry.url) && now - entry.touched >= minAgeMs)
    .sort((a, b) => a.touched - b.touched);

  const evict: string[] = [];
  for (const entry of candidates) {
    if (total <= budgetBytes) break;
    evict.push(entry.key);
    total -= entry.bytes;
  }
  return evict;
}
