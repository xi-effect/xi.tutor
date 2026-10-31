/** Больше этого холст одной картинки или страницы не растим: 16 Мп ≈ 64 МБ RGBA. */
export const MAX_RASTER_PIXELS = 16_777_216;

/** Длинная сторона растра. Выше неё на экране страница всё равно не помещается целиком. */
export const MAX_RASTER_EDGE = 8192;

const MIN_ZOOM_STEP = 0.125;
const MAX_ZOOM_STEP = 4;

/**
 * Зум камеры, округлённый вверх к степени двойки.
 * Холст пересобирается только на границе шага и остаётся не мыльнее экрана.
 */
export function zoomStepCeil(zoom: number): number {
  if (!Number.isFinite(zoom) || zoom <= 0) return 1;
  const step = 2 ** Math.ceil(Math.log2(zoom));
  return Math.min(MAX_ZOOM_STEP, Math.max(MIN_ZOOM_STEP, step));
}

export function fitInsideBudget(width: number, height: number): { width: number; height: number } {
  let w = Math.max(1, width);
  let h = Math.max(1, height);
  const edgeScale = Math.min(1, MAX_RASTER_EDGE / Math.max(w, h));
  w *= edgeScale;
  h *= edgeScale;
  const areaScale = Math.min(1, Math.sqrt(MAX_RASTER_PIXELS / (w * h)));
  w *= areaScale;
  h *= areaScale;
  let nextWidth = Math.max(1, Math.round(w));
  let nextHeight = Math.max(1, Math.round(h));
  if (nextWidth * nextHeight > MAX_RASTER_PIXELS) {
    const scale = Math.sqrt(MAX_RASTER_PIXELS / (nextWidth * nextHeight));
    nextWidth = Math.max(1, Math.floor(nextWidth * scale));
    nextHeight = Math.max(1, Math.floor(nextHeight * scale));
  }
  return { width: nextWidth, height: nextHeight };
}

/**
 * Пиксели холста под CSS-размер фигуры.
 * Камера увеличивает фигуру через CSS transform, `clientWidth` этого не видит,
 * поэтому резкость = css × шаг зума × dpr.
 * `supersample` (для PDF и слайдов) даёт запас на текст, пока результат влезает в бюджет.
 * Иначе запас снимается и остаётся ровно экранная резкость.
 */
export function rasterPixelsForCssSize(
  cssWidth: number,
  cssHeight: number,
  zoom: number,
  dpr: number,
  options?: { supersample?: number },
): { width: number; height: number; zoomStep: number } {
  const zoomStep = zoomStepCeil(zoom);
  const safeDpr = Math.max(1, dpr || 1);
  const supersample = Math.max(1, options?.supersample ?? 1);
  const screen = fitInsideBudget(cssWidth * safeDpr * zoomStep, cssHeight * safeDpr * zoomStep);

  if (supersample <= 1) {
    return { ...screen, zoomStep };
  }

  const sharp = fitInsideBudget(
    cssWidth * safeDpr * zoomStep * supersample,
    cssHeight * safeDpr * zoomStep * supersample,
  );
  const screenPixels = screen.width * screen.height;
  const sharpPixels = sharp.width * sharp.height;
  // Запас окупается, только если бюджет его не срезал почти до экранного размера.
  if (sharpPixels >= screenPixels * supersample * supersample * 0.85) {
    return { ...sharp, zoomStep };
  }
  return { ...screen, zoomStep };
}

/**
 * Размер декодированной картинки под текущий масштаб.
 * `null` — на экране нужен оригинал, уменьшать нельзя.
 * `steppedScreenScale` — уже округлённый tldraw множитель: zoom × (ширина фигуры / ширина файла).
 */
export function displayPixelSize(
  assetWidth: number,
  assetHeight: number,
  steppedScreenScale: number,
  dpr: number,
): { width: number; height: number } | null {
  if (assetWidth < 2 || assetHeight < 2) return null;
  const ratio = Math.max(0, steppedScreenScale) * Math.max(1, dpr || 1);
  if (ratio <= 0) return null;

  const requestedW = assetWidth * ratio;
  const requestedH = assetHeight * ratio;
  if (requestedW >= assetWidth * 0.9 && requestedH >= assetHeight * 0.9) return null;

  const fitted = fitInsideBudget(
    Math.min(requestedW, assetWidth),
    Math.min(requestedH, assetHeight),
  );
  if (fitted.width * fitted.height > assetWidth * assetHeight * 0.85) return null;
  return fitted;
}

/** Общая копия для соседних зумов: 1000 и 1200 px делят бакет 2048. */
export function edgeBucket(edge: number): number {
  const safe = Math.max(32, Math.round(edge));
  return 2 ** Math.ceil(Math.log2(safe));
}
