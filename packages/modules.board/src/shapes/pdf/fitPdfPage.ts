import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { rasterPixelsForCssSize } from '../../utils/rasterBudget';

export type FittedPdfPage = {
  cssWidth: number;
  cssHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  scale: number;
};

/** Вписывает страницу PDF в ячейку и считает пиксели холста под текущий зум. */
export function fitPdfPagePixels(
  pageWidth: number,
  pageHeight: number,
  cellWidth: number,
  cellHeight: number,
  zoom: number,
  dpr: number,
  supersample = 2,
): FittedPdfPage {
  const baseScale = Math.min(cellWidth / pageWidth, cellHeight / pageHeight);
  const cssWidth = pageWidth * baseScale;
  const cssHeight = pageHeight * baseScale;
  const pixels = rasterPixelsForCssSize(cssWidth, cssHeight, zoom, dpr, { supersample });
  return {
    cssWidth,
    cssHeight,
    pixelWidth: pixels.width,
    pixelHeight: pixels.height,
    scale: pixels.width / pageWidth,
  };
}

function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

export type PdfPagePaint = {
  task: RenderTask;
  /** Переносит готовый кадр на видимый холст. До этого старая страница остаётся. */
  commit: () => void;
  discard: () => void;
};

/**
 * Рисует страницу в запасной холст. Видимый холст не трогаем, пока кадр не готов:
 * смена `canvas.width` сразу стирает картинку, и при зуме страница мигает.
 */
export function startPdfPagePaint(
  page: PDFPageProxy,
  target: HTMLCanvasElement,
  fitted: FittedPdfPage,
): PdfPagePaint | null {
  const buffer = document.createElement('canvas');
  buffer.width = fitted.pixelWidth;
  buffer.height = fitted.pixelHeight;
  const bufferCtx = buffer.getContext('2d');
  if (!bufferCtx) return null;

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    releaseCanvas(buffer);
  };

  const task = page.render({
    canvasContext: bufferCtx,
    viewport: page.getViewport({ scale: fitted.scale }),
    intent: 'print',
  });

  return {
    task,
    commit() {
      if (released) return;
      if (target.width !== buffer.width || target.height !== buffer.height) {
        target.width = buffer.width;
        target.height = buffer.height;
      }
      target.getContext('2d')?.drawImage(buffer, 0, 0);
      target.style.width = `${fitted.cssWidth}px`;
      target.style.height = `${fitted.cssHeight}px`;
      release();
    },
    discard: release,
  };
}

/** Растр страниц для OCR и «извлечь картинку»: не мельче зума 100%, после записи холст отпускается. */
export async function renderPdfSliceToPngBlob(options: {
  pdfDoc: PDFDocumentProxy;
  startPage: number;
  pageCount: number;
  cellWidth: number;
  cellHeight: number;
  zoom: number;
  dpr: number;
}): Promise<Blob | null> {
  const { pdfDoc, startPage, pageCount, cellWidth, cellHeight, zoom, dpr } = options;
  const canvases: HTMLCanvasElement[] = [];

  try {
    for (let i = 0; i < pageCount; i++) {
      const pageNum = startPage + i;
      if (pageNum > pdfDoc.numPages) break;
      const page = await pdfDoc.getPage(pageNum);
      const vp1 = page.getViewport({ scale: 1 });
      const fitted = fitPdfPagePixels(vp1.width, vp1.height, cellWidth, cellHeight, zoom, dpr);
      const canvas = document.createElement('canvas');
      canvas.width = fitted.pixelWidth;
      canvas.height = fitted.pixelHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      await page.render({
        canvasContext: ctx,
        viewport: page.getViewport({ scale: fitted.scale }),
        intent: 'print',
      }).promise;
      page.cleanup();
      canvases.push(canvas);
    }

    if (canvases.length === 0) return null;
    if (canvases.length === 1) {
      return await new Promise((resolve) => {
        canvases[0].toBlob(resolve, 'image/png');
      });
    }

    const commonW = canvases[0].width;
    const heights = canvases.map((canvas) => (canvas.height / canvas.width) * commonW);
    const combined = document.createElement('canvas');
    combined.width = commonW;
    combined.height = Math.max(1, Math.round(heights.reduce((sum, height) => sum + height, 0)));
    const ctx = combined.getContext('2d');
    if (!ctx) return null;
    let y = 0;
    for (let i = 0; i < canvases.length; i++) {
      const height = heights[i];
      ctx.drawImage(
        canvases[i],
        0,
        0,
        canvases[i].width,
        canvases[i].height,
        0,
        y,
        commonW,
        height,
      );
      y += height;
    }
    const blob = await new Promise<Blob | null>((resolve) => {
      combined.toBlob(resolve, 'image/png');
    });
    releaseCanvas(combined);
    return blob;
  } finally {
    canvases.forEach(releaseCanvas);
  }
}
