/**
 * Устройства, где вкладку убивает система при нехватке памяти (iPad/iPhone Safari,
 * слабые Android). Там вместо ошибки страница падает с «A problem repeatedly occurred»,
 * поэтому бюджеты памяти для картинок, холстов и параллельной декодировки ниже.
 */
let cached: boolean | null = null;

export function isMemoryConstrainedDevice(): boolean {
  if (cached !== null) return cached;
  if (typeof navigator === 'undefined') {
    cached = false;
    return cached;
  }
  const ua = navigator.userAgent || '';
  const isIosFamily =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS притворяется Mac, но у него есть тач.
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1);
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  cached = isIosFamily || (typeof deviceMemory === 'number' && deviceMemory <= 4);
  return cached;
}
