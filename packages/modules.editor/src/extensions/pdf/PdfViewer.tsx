import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RenderTask } from 'pdfjs-dist';
import { pdfDocCache } from '../../utils/pdfDocCache';
import { PageControls } from '../media/PageControls';
import { StrokeT } from '../../types';
import { DrawingOverlay, DrawingToolbar } from '../../ui/components/drawing';
import { useDrawingLayer } from '../../hooks';

const PDF_RENDER_QUALITY_SCALE = 2;

type PdfViewerProps = {
  blobUrl: string;
  fileName: string;
  totalPages: number;
  annotations: Record<number, StrokeT[]>;
  onAnnotationsChange: (next: Record<number, StrokeT[]>) => void;
  isDrawingBarOpen: boolean;
  closeDrawingBar: () => void;
  isReadOnly?: boolean;
  onExtractPage?: (blob: Blob, page: number) => void;
};

export const PdfViewer = ({
  blobUrl,
  fileName,
  totalPages: initialTotalPages,
  annotations,
  onAnnotationsChange,
  isDrawingBarOpen,
  closeDrawingBar,
  isReadOnly,
  onExtractPage,
}: PdfViewerProps) => {
  const { t } = useTranslation('editor');
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.max(1, initialTotalPages));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [pageRatio, setPageRatio] = useState<number | null>(null);

  const currentStrokes = annotations[page] ?? [];
  const handlePageStrokesChange = useCallback(
    (next: StrokeT[]) => onAnnotationsChange({ ...annotations, [page]: next }),
    [annotations, page, onAnnotationsChange],
  );

  const { overlayProps, toolbarProps } = useDrawingLayer(currentStrokes, handlePageStrokesChange);

  useEffect(() => {
    const el = containerRef.current;
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
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    setPageRatio(null);
  }, [blobUrl]);

  useEffect(() => {
    setLoading(true);
  }, [blobUrl, page]);

  useEffect(() => {
    if (!blobUrl || containerSize.w <= 0 || containerSize.h <= 0) return;

    let cancelled = false;

    const render = async () => {
      try {
        const pdfDoc = await pdfDocCache.get(blobUrl);
        if (cancelled) return;

        setTotalPages(pdfDoc.numPages);
        const pageNum = Math.min(page, pdfDoc.numPages);
        const pdfPage = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const vp1 = pdfPage.getViewport({ scale: 1 });
        const ratio = vp1.width / vp1.height;
        if (!(ratio > 0)) return;
        setPageRatio((prev) => (prev != null && Math.abs(prev - ratio) < 1e-4 ? prev : ratio));

        const boxRatio = containerSize.w / containerSize.h;
        if (!Number.isFinite(boxRatio) || Math.abs(boxRatio - ratio) / ratio > 0.015) return;

        renderTaskRef.current?.cancel();

        const dpr = window.devicePixelRatio || 1;
        const viewport = pdfPage.getViewport({
          scale: (containerSize.w / vp1.width) * dpr * PDF_RENDER_QUALITY_SCALE,
        });

        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderTask = pdfPage.render({
          canvasContext: ctx,
          viewport,
          intent: 'print',
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if ((err as { name?: string })?.name === 'RenderingCancelledException') return;
        console.error('[PdfViewer] render error:', err);
        setError(t('pdf.renderError'));
        setLoading(false);
      }
    };

    render();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [blobUrl, page, containerSize.w, containerSize.h, t]);

  const extractRef = useRef(onExtractPage);
  extractRef.current = onExtractPage;
  const pageRef = useRef(page);
  pageRef.current = page;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const handleExtract = useCallback(async () => {
    const extract = extractRef.current;
    const canvas = canvasRef.current;
    if (!extract || loadingRef.current || !canvas || canvas.width === 0) return;
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    if (blob) extract(blob, pageRef.current);
  }, []);

  if (error) {
    return (
      <div className="text-text-disabled flex h-40 w-full items-center justify-center text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col">
      {isDrawingBarOpen && <DrawingToolbar {...toolbarProps} onClose={closeDrawingBar} />}

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={pageRatio ? { aspectRatio: pageRatio } : { minHeight: 320 }}
      >
        {loading && (
          <div className="text-text-disabled absolute inset-0 z-5 flex items-center justify-center text-sm">
            {t('pdf.loading')}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ opacity: loading ? 0.3 : 1 }}
        />
        <DrawingOverlay
          className="absolute inset-0"
          {...overlayProps}
          isActive={isDrawingBarOpen && !isReadOnly && !loading}
        />
      </div>
      <PageControls
        fileName={fileName}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onExtractPage={isReadOnly ? undefined : handleExtract}
        extractTitle={t('pdf.extractPage')}
      />
    </div>
  );
};
