import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RenderTask } from 'pdfjs-dist';
import { pdfDocCache } from '../../utils/pdfDocCache';
import { PageControls } from '../media/PageControls';
import { StrokeT } from '../../types';
import { DrawingOverlay } from '../../ui/components/drawing/DrawingOverlay';
import { DrawingToolbar } from '../../ui/components/drawing/DrawingToolbar';
import { useDrawingTool } from '../../hooks';

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
  const [canvasCssSize, setCanvasCssSize] = useState({ w: 0, h: 0 });

  const currentStrokes = annotations[page] ?? [];
  const handlePageStrokesChange = useCallback(
    (next: StrokeT[]) => onAnnotationsChange({ ...annotations, [page]: next }),
    [annotations, page, onAnnotationsChange],
  );

  const { tool, canUndo, clear, undo, setTool } = useDrawingTool(
    currentStrokes,
    handlePageStrokesChange,
  );

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
    if (!blobUrl || containerSize.w <= 0 || containerSize.h <= 0) return;

    let cancelled = false;

    const render = async () => {
      try {
        setLoading(true);
        const pdfDoc = await pdfDocCache.get(blobUrl);
        if (cancelled) return;

        setTotalPages(pdfDoc.numPages);
        const pageNum = Math.min(page, pdfDoc.numPages);
        const pdfPage = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        renderTaskRef.current?.cancel();

        const dpr = window.devicePixelRatio || 1;
        const vp1 = pdfPage.getViewport({ scale: 1 });
        const baseScale = Math.min(containerSize.w / vp1.width, containerSize.h / vp1.height);
        const viewport = pdfPage.getViewport({ scale: baseScale * dpr * PDF_RENDER_QUALITY_SCALE });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${vp1.width * baseScale}px`;
        canvas.style.height = `${vp1.height * baseScale}px`;
        setCanvasCssSize({ w: vp1.width * baseScale, h: vp1.height * baseScale });

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

  const handleExtract = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || !onExtractPage) return;
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    if (blob) onExtractPage(blob, page);
  }, [onExtractPage, page]);

  if (error) {
    return (
      <div className="text-text-disabled flex h-full w-full items-center justify-center text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div
        ref={containerRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
      >
        {loading && (
          <div className="text-text-disabled absolute inset-0 z-5 flex items-center justify-center text-sm">
            {t('pdf.loading')}
          </div>
        )}
        <div className="relative" style={{ width: canvasCssSize.w, height: canvasCssSize.h }}>
          <canvas ref={canvasRef} className="block" style={{ opacity: loading ? 0.3 : 1 }} />
          <DrawingOverlay
            className="absolute inset-0"
            strokes={annotations[page] ?? []}
            onChangeStrokes={(next) => onAnnotationsChange({ ...annotations, [page]: next })}
            tool={tool}
            isActive={isDrawingBarOpen && !isReadOnly && !loading}
          />
        </div>
        {isDrawingBarOpen && (
          <DrawingToolbar
            tool={tool}
            onToolChange={setTool}
            onUndo={undo}
            onClear={clear}
            onClose={closeDrawingBar}
            canUndo={canUndo}
          />
        )}
      </div>
      <PageControls
        fileName={fileName}
        currentPage={page}
        totalPages={totalPages}
        disabled={loading}
        onPageChange={setPage}
        onExtractPage={!isReadOnly && !loading ? handleExtract : undefined}
        extractTitle={t('pdf.extractPage')}
      />
    </div>
  );
};
