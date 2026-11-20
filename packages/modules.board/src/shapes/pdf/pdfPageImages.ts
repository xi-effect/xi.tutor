import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { fitPdfPagePixels } from './fitPdfPage';
import { pdfDocCache } from './pdfDocCache';
import { retainBlobUrl } from '../../utils/resolveAssetUrl';
import { isMemoryConstrainedDevice } from '../../utils/deviceBudget';

export type PageImage = { url: string; width: number; height: number };
type Entry = {
  refs: number;
  bytes: number;
  image?: PageImage;
  task?: RenderTask;
  promise: Promise<PageImage>;
};
// One queue for all board PDFs; unused images are evicted in LRU order.
const entries = new Map<string, Entry>();
let tail: Promise<unknown> = Promise.resolve();
const budget = () => (isMemoryConstrainedDevice() ? 24 : 64) * 1024 * 1024;
const abort = () => new DOMException('PDF image request released', 'AbortError');
function trim() {
  let bytes = [...entries.values()].reduce((n, e) => n + e.bytes, 0);
  for (const [key, entry] of entries) {
    if (bytes <= budget()) break;
    if (entry.refs || !entry.image) continue;
    URL.revokeObjectURL(entry.image.url);
    entries.delete(key);
    bytes -= entry.bytes;
  }
}

export function acquirePdfPageImage(options: {
  source: string;
  page: number;
  width: number;
  height: number;
  zoom: number;
  dpr: number;
}) {
  const { source, page: pageNumber, width, height, zoom, dpr } = options;
  const key = JSON.stringify([source, pageNumber, width, height, zoom, dpr]);
  let entry = entries.get(key);
  if (!entry) {
    const next: Entry = { refs: 0, bytes: 0, promise: null! };
    const releaseBlob = retainBlobUrl(source);
    next.promise = tail
      .then(async () => {
        if (!next.refs) throw abort();
        let doc: PDFDocumentProxy | undefined;
        let canvas: HTMLCanvasElement | undefined;
        try {
          doc = await pdfDocCache.get(source);
          if (!next.refs) throw abort();
          const page = await doc.getPage(pageNumber);
          if (!next.refs) throw abort();
          const vp = page.getViewport({ scale: 1 });
          const fitted = fitPdfPagePixels(vp.width, vp.height, width, height, zoom, dpr);
          canvas = document.createElement('canvas');
          canvas.width = fitted.pixelWidth;
          canvas.height = fitted.pixelHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('PDF canvas context unavailable');
          next.task = page.render({
            canvasContext: ctx,
            viewport: page.getViewport({ scale: fitted.scale }),
            intent: 'print',
          });
          await next.task.promise;
          next.task = undefined;
          if (!next.refs) throw abort();
          const blob = await new Promise<Blob>((resolve, reject) =>
            canvas!.toBlob(
              (value) => (value ? resolve(value) : reject(new Error('PDF image encoding failed'))),
              'image/png',
            ),
          );
          if (!next.refs) throw abort();
          next.image = {
            url: URL.createObjectURL(blob),
            width: canvas.width,
            height: canvas.height,
          };
          next.bytes = canvas.width * canvas.height * 4 + blob.size;
          page.cleanup();
          trim();
          return next.image;
        } finally {
          next.task = undefined;
          if (canvas) {
            canvas.width = 0;
            canvas.height = 0;
          }
          if (doc) pdfDocCache.release(source);
        }
      })
      .catch((error) => {
        if (entries.get(key) === next) entries.delete(key);
        throw error;
      })
      .finally(releaseBlob);
    tail = next.promise.catch(() => undefined);
    entries.set(key, next);
    entry = next;
  } else {
    entries.delete(key);
    entries.set(key, entry);
  }
  entry.refs++;
  const held = entry;
  let released = false;
  return {
    promise: held.promise,
    release() {
      if (released) return;
      released = true;
      held.refs--;
      if (!held.refs && !held.image) {
        if (entries.get(key) === held) entries.delete(key);
        held.task?.cancel();
      }
      trim();
    },
  };
}
