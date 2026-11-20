export type PdfPageBox = { width: number; height: number };

/** Сумма пропорций страниц, поставленных друг под другом на одну ширину. */
export function pdfPageStackAspect(pages: PdfPageBox[]): number {
  return pages.reduce((sum, page) => {
    if (!(page.width > 0) || !(page.height > 0)) return sum;
    return sum + page.height / page.width;
  }, 0);
}

export function samePdfPageBoxes(a: PdfPageBox[], b: PdfPageBox[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (page, index) => page.width === b[index]?.width && page.height === b[index]?.height,
  );
}

/** Ключ уже применённой подгонки: тот же набор пропорций не двигает шейп повторно. */
export function pdfBoundsFitKey(pages: PdfPageBox[]): string {
  return pdfPageStackAspect(pages).toFixed(4);
}

const CONTROLS_FALLBACK = 40;

/** Пропорция страниц и фиксированная высота панели. Панель не участвует в масштабе. */
export function pdfFrameMetrics(props: {
  w: number;
  h: number;
  boundsFit?: string;
  controlsHeight?: number;
}): { aspect: number; controlsHeight: number } | null {
  const aspect = Number(props.boundsFit);
  if (!Number.isFinite(aspect) || aspect <= 0) return null;
  if (props.controlsHeight != null && props.controlsHeight >= 0) {
    return { aspect, controlsHeight: props.controlsHeight };
  }
  const residual = props.h - props.w * aspect;
  if (residual >= 0 && residual <= 96) return { aspect, controlsHeight: residual };
  return { aspect, controlsHeight: CONTROLS_FALLBACK };
}

/**
 * Новая рамка после ресайза: ширина меняется, высота страницы держит пропорцию,
 * панель остаётся прежней. Так по бокам не появляется пустое поле.
 */
export function resizePdfFrame(input: {
  nextWidth: number;
  aspect: number;
  controlsHeight: number;
  minSize: number;
  maxSize: number;
}): { w: number; h: number } {
  const { aspect, controlsHeight, minSize, maxSize } = input;
  const heightFor = (width: number) => Math.round(width * aspect + controlsHeight);
  let w = Math.max(1, input.nextWidth);

  const fitWithinMax = () => {
    const contentMax = Math.max(1, maxSize - controlsHeight);
    const contentH = w * aspect;
    if (w <= maxSize && contentH + controlsHeight <= maxSize) return;
    const scale = Math.min(maxSize / w, contentMax / contentH);
    w *= scale;
  };

  fitWithinMax();
  const contentH = w * aspect;
  const minSide = Math.min(w, contentH);
  if (minSide < minSize && minSide > 0) w *= minSize / minSide;
  fitWithinMax();

  w = Math.max(1, Math.round(w));
  let h = heightFor(w);
  while ((h > maxSize || w > maxSize) && w > 1) {
    w -= 1;
    h = heightFor(w);
  }
  return { w, h };
}

/** Сдвигает якорь, чтобы при коррекции высоты противоположный край остался на месте. */
export function pdfResizeAnchorShift(
  handle: string,
  deltaW: number,
  deltaH: number,
  rotation: number,
): { x: number; y: number } {
  let x = 0;
  let y = 0;
  if (handle === 'left' || handle.endsWith('left')) x = deltaW;
  else if (handle === 'top' || handle === 'bottom') x = deltaW / 2;
  if (handle === 'top' || handle.startsWith('top')) y = deltaH;
  else if (handle === 'left' || handle === 'right') y = deltaH / 2;

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

/**
 * Высота объекта под страницы на текущей ширине плюс панель управления.
 * Ширина сохраняется, чтобы объект рос вниз и не сдвигал соседей по горизонтали.
 */
export function fitPdfShapeBounds(input: {
  width: number;
  height: number;
  pages: PdfPageBox[];
  controlsHeight: number;
}): { w: number; h: number } | null {
  const aspect = pdfPageStackAspect(input.pages);
  if (!(aspect > 0) || !(input.width > 0)) return null;

  const w = input.width;
  const h = Math.max(1, Math.round(w * aspect + Math.max(0, input.controlsHeight)));
  if (h === Math.round(input.height)) return null;
  return { w, h };
}
