import * as pdfjsLib from 'pdfjs-dist';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { pdfDocCache } from './pdfDocCache';

/**
 * Рендерит видимые страницы PDF в один PNG data:URL для SVG-экспорта шейпа.
 * `qualityScale` — множитель разрешения относительно CSS-размера шейпа.
 */
export async function renderPdfShapeToDataUrl(opts: {
  src: string;
  token: string;
  startPage: number;
  pagesVisible: number;
  width: number;
  height: number;
  qualityScale?: number;
}): Promise<string | null> {
  const { src, token, startPage, pagesVisible, width, height, qualityScale = 2 } = opts;
  if (!src || !token || width <= 0 || height <= 0) return null;

  const blobUrl = await resolveAssetUrl(src, token);
  const pdfDoc = await pdfDocCache.get(blobUrl);

  try {
    const cellH = height / pagesVisible;
    const canvases: HTMLCanvasElement[] = [];

    for (let i = 0; i < pagesVisible; i++) {
      const pageNum = startPage + i;
      if (pageNum > pdfDoc.numPages) break;

      const page = await pdfDoc.getPage(pageNum);
      const vp1 = page.getViewport({ scale: 1 });
      const baseScale = Math.min(width / vp1.width, cellH / vp1.height);
      const scale = baseScale * Math.max(1, qualityScale);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      await page.render({
        canvasContext: ctx,
        viewport,
        intent: 'print',
      }).promise;

      canvases.push(canvas);
    }

    if (canvases.length === 0) return null;

    if (canvases.length === 1) {
      return canvases[0].toDataURL('image/png');
    }

    const commonW = canvases[0].width;
    const heights = canvases.map((c) => (c.height / c.width) * commonW);
    const combinedH = heights.reduce((sum, h) => sum + h, 0);
    const offscreen = document.createElement('canvas');
    offscreen.width = commonW;
    offscreen.height = Math.max(1, Math.round(combinedH));
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    let y = 0;
    for (let i = 0; i < canvases.length; i++) {
      const h = heights[i];
      ctx.drawImage(canvases[i], 0, 0, canvases[i].width, canvases[i].height, 0, y, commonW, h);
      y += h;
    }

    return offscreen.toDataURL('image/png');
  } finally {
    pdfDocCache.release(blobUrl);
  }
}

// Keep worker src in sync with PdfViewer (CDN for production bundling).
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}
