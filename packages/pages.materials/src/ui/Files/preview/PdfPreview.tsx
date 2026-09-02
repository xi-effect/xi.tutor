import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { cn } from '@xipkg/utils';
import { PagePager } from './PagePager';
import { loadPdfDocument } from './pdfDocCache';
import { FilePreviewLoading } from './FilePreviewLoading';
import { PreviewZoomStage } from './PreviewZoomStage';

const PDF_RENDER_QUALITY_SCALE = 2;

type PdfPreviewProps = {
  source: Blob;
  isFullscreen: boolean;
  onError: () => void;
};

const settleRenderTask = async (task: RenderTask | null) => {
  if (!task) return;
  try {
    await task.promise;
  } catch {
    // RenderingCancelledException и прочие ошибки после cancel()
  }
};

export const PdfPreview = ({ source, isFullscreen, onError }: PdfPreviewProps) => {
  const sizeHostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [docReady, setDocReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setPage(1);
    setDocReady(false);
    setLoading(true);
    docRef.current = null;

    let cancelled = false;
    let loadedDoc: PDFDocumentProxy | null = null;

    const load = async () => {
      try {
        const pdfDoc = await loadPdfDocument(source);
        if (cancelled) {
          await pdfDoc.destroy();
          return;
        }

        loadedDoc = pdfDoc;
        docRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        setDocReady(true);
      } catch (error) {
        console.error('[PdfPreview] load error:', error);
        if (!cancelled) onErrorRef.current();
      }
    };

    void load();

    return () => {
      cancelled = true;
      const task = renderTaskRef.current;
      task?.cancel();
      renderTaskRef.current = null;
      docRef.current = null;
      const doc = loadedDoc;
      void settleRenderTask(task).then(() => {
        void doc?.destroy();
      });
    };
  }, [source]);

  useEffect(() => {
    const el = sizeHostRef.current;
    if (!el) return;

    let raf = 0;
    const updateSize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = Math.round(el.clientWidth);
        const h = Math.round(el.clientHeight);
        if (w <= 0 || h <= 0) return;
        setContainerSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!docReady || containerSize.w <= 0 || containerSize.h <= 0) return;
    const pdfDoc = docRef.current;
    if (!pdfDoc) return;

    let cancelled = false;

    const render = async () => {
      try {
        const previous = renderTaskRef.current;
        if (previous) {
          previous.cancel();
          await settleRenderTask(previous);
          if (renderTaskRef.current === previous) {
            renderTaskRef.current = null;
          }
        }
        if (cancelled) return;

        setLoading(true);
        const pageNum = Math.min(page, pdfDoc.numPages);
        const pdfPage = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const vp1 = pdfPage.getViewport({ scale: 1 });
        const baseScale = Math.min(containerSize.w / vp1.width, containerSize.h / vp1.height);
        if (baseScale <= 0) return;

        const viewport = pdfPage.getViewport({
          scale: baseScale * dpr * PDF_RENDER_QUALITY_SCALE,
        });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${vp1.width * baseScale}px`;
        canvas.style.height = `${vp1.height * baseScale}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const renderTask = pdfPage.render({
          canvasContext: ctx,
          viewport,
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if ((err as { name?: string })?.name === 'RenderingCancelledException') return;
        console.error('[PdfPreview] render error:', err);
        onErrorRef.current();
        setLoading(false);
      }
    };

    void render();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [docReady, page, containerSize.w, containerSize.h]);

  return (
    <div
      className={cn('bg-background-page relative min-h-0 w-full flex-1 overflow-hidden rounded-xl')}
    >
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <FilePreviewLoading isFullscreen={isFullscreen} className="min-h-0" />
        </div>
      ) : null}
      <div ref={sizeHostRef} className="absolute inset-0 p-4 pb-14">
        <PreviewZoomStage enabled={isFullscreen} resetKey={page} className="h-full w-full">
          <canvas
            ref={canvasRef}
            className="block max-h-full max-w-full rounded-lg shadow-[0px_8px_24px_rgba(16,16,16,0.08)]"
            style={{ opacity: loading ? 0.3 : 1 }}
          />
        </PreviewZoomStage>
      </div>
      <PagePager
        currentPage={page}
        totalPages={totalPages}
        disabled={loading}
        onPageChange={setPage}
        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2"
      />
    </div>
  );
};
