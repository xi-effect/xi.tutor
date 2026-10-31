import type { PDFDocumentProxy } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';

type CacheEntry = {
  doc: PDFDocumentProxy;
  refs: number;
};

type PendingLoad = {
  promise: Promise<PDFDocumentProxy>;
  refs: number;
};

const cache = new Map<string, CacheEntry>();
const pendingLoads = new Map<string, PendingLoad>();

export const pdfDocCache = {
  async get(blobUrl: string): Promise<PDFDocumentProxy> {
    const cached = cache.get(blobUrl);
    if (cached) {
      cached.refs += 1;
      return cached.doc;
    }

    const pending = pendingLoads.get(blobUrl);
    if (pending) {
      pending.refs += 1;
      return pending.promise;
    }

    const load: PendingLoad = {
      refs: 1,
      promise: null as unknown as Promise<PDFDocumentProxy>,
    };
    load.promise = pdfjsLib
      .getDocument(blobUrl)
      .promise.then((doc) => {
        pendingLoads.delete(blobUrl);
        if (load.refs <= 0) {
          doc.destroy();
          throw new Error('pdf released before load finished');
        }
        cache.set(blobUrl, { doc, refs: load.refs });
        return doc;
      })
      .catch((error: unknown) => {
        pendingLoads.delete(blobUrl);
        throw error;
      });
    pendingLoads.set(blobUrl, load);
    return load.promise;
  },

  release(blobUrl: string) {
    const pending = pendingLoads.get(blobUrl);
    if (pending && !cache.has(blobUrl)) {
      pending.refs -= 1;
      return;
    }

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
