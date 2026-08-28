import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// CDN, как на доске и в редакторе: локальный worker через Vite ?url
// на первом открытии может не успеть подняться, и render() зависает.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function loadPdfDocument(source: Blob): Promise<PDFDocumentProxy> {
  const bytes = new Uint8Array(await source.arrayBuffer());
  return pdfjsLib.getDocument({ data: bytes.slice() }).promise;
}
