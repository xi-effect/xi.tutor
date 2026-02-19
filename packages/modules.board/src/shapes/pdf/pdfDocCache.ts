import type { PDFDocumentProxy } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';

type CacheEntry = {
  doc: PDFDocumentProxy;
  refs: number;
};

const cache = new Map<string, CacheEntry>();
const pendingLoads = new Map<string, Promise<PDFDocumentProxy>>();

export const pdfDocCache = {
  async get(blobUrl: string): Promise<PDFDocumentProxy> {
    const cached = cache.get(blobUrl);
    if (cached) {
      cached.refs += 1;
      return cached.doc;
    }

    const pending = pendingLoads.get(blobUrl);
    if (pending) return pending;

    const loadPromise = pdfjsLib.getDocument(blobUrl).promise.then((doc) => {
      cache.set(blobUrl, { doc, refs: 1 });
      pendingLoads.delete(blobUrl);
      return doc;
    });

    pendingLoads.set(blobUrl, loadPromise);
    return loadPromise;
  },

  release(blobUrl: string) {
    const entry = cache.get(blobUrl);
    if (!entry) return;

    entry.refs -= 1;
    if (entry.refs <= 0) {
      entry.doc.destroy();
      cache.delete(blobUrl);
    }
  },

  size() {
    return cache.size;
  },
};
