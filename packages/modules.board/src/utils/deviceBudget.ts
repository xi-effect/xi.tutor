/**
 * Сколько пикселей разрешаем декодировать целиком (`createImageBitmap`) ради уменьшенной копии.
 * Растр RGBA = 4 байта на пиксель: 64 Мп ≈ 256 МБ на iPhone/iPad, 48 Мп ≈ 192 МБ на десктопе.
 * Порог покрывает фото с камер (12, 24 и 48 Мп = 8064×6048): их уменьшаем под экран.
 * Файл крупнее не гоняем через `createImageBitmap`, но `<img>` всё равно его показывает.
 */
export const MAX_DECODE_PIXELS_CONSTRAINED = 64_000_000;
export const MAX_DECODE_PIXELS = 48_000_000;

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

export function maxDecodePixels(): number {
  return isMemoryConstrainedDevice() ? MAX_DECODE_PIXELS_CONSTRAINED : MAX_DECODE_PIXELS;
}
