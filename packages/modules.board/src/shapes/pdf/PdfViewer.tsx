import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from 'tldraw';
import { useCurrentUser } from 'common.services';
import * as pdfjsLib from 'pdfjs-dist';
import type { RenderTask } from 'pdfjs-dist';
import { useYjsContext } from '../../providers/YjsProvider';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { pdfDocCache } from './pdfDocCache';
import { PdfPageControls } from './PdfPageControls';
import type { PdfShape } from './PdfShape';

// Используем CDN для worker файла, чтобы избежать проблем с бандлингом в продакшене
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type PdfViewerProps = {
  shape: PdfShape;
};

export const PdfViewer = ({ shape }: PdfViewerProps) => {
  const editor = useEditor();
  const { data: user } = useCurrentUser();
  const { pdfPagesMap, token } = useYjsContext();
  const isTutor = user?.default_layout === 'tutor';
  const userId = user?.id?.toString() ?? '';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const [localPage, setLocalPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { src, totalPages, currentPage: tutorPage, studentCanFlip } = shape.props;

  const canFlip = isTutor || studentCanFlip;
  const displayPage = !isTutor && !studentCanFlip ? tutorPage : localPage;

  useEffect(() => {
    if (!pdfPagesMap || !userId || !shape.id) return;

    const key = `${shape.id}:${userId}`;
    const saved = pdfPagesMap.get(key);
    if (saved && saved >= 1 && saved <= totalPages) {
      setLocalPage(saved);
    }
  }, [pdfPagesMap, userId, shape.id, totalPages]);

  useEffect(() => {
    if (!pdfPagesMap) return;

    const handler = () => {
      if (!userId || !shape.id) return;
      const key = `${shape.id}:${userId}`;
      const val = pdfPagesMap.get(key);
      if (val && val >= 1 && val <= totalPages && val !== localPage) {
        setLocalPage(val);
      }
    };

    pdfPagesMap.observe(handler);
    return () => pdfPagesMap.unobserve(handler);
  }, [pdfPagesMap, userId, shape.id, totalPages, localPage]);

  useEffect(() => {
    if (!src || !token) return;

    let cancelled = false;

    const render = async () => {
      try {
        setLoading(true);
        const blobUrl = await resolveAssetUrl(src, token);
        if (cancelled) return;

        const pdfDoc = await pdfDocCache.get(blobUrl);
        if (cancelled) return;

        const pageNum = Math.min(Math.max(1, displayPage), pdfDoc.numPages);
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const dpr = window.devicePixelRatio || 1;
        const displayW = container.clientWidth;
        const displayH = container.clientHeight;
        const baseScale = displayW / page.getViewport({ scale: 1 }).width;
        const scale = baseScale * dpr;

        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if ((err as { name?: string })?.name === 'RenderingCancelledException') return;
        console.error('[PdfViewer] render error:', err);
        setError('Не удалось отобразить PDF');
        setLoading(false);
      }
    };

    render();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [src, token, displayPage, shape.props.w]);

  const handlePageChange = useCallback(
    (page: number) => {
      setLocalPage(page);

      if (pdfPagesMap && userId) {
        const key = `${shape.id}:${userId}`;
        pdfPagesMap.doc?.transact(() => {
          pdfPagesMap.set(key, page);
        }, 'pdf-page');
      }

      if (isTutor && !studentCanFlip) {
        editor.updateShape<PdfShape>({
          id: shape.id,
          type: 'pdf',
          props: { currentPage: page },
        });
      }
    },
    [editor, shape.id, pdfPagesMap, userId, isTutor, studentCanFlip],
  );

  if (error) {
    return (
      <div className="text-gray-40 flex h-full w-full flex-col items-center justify-center gap-2">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-30">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2v6h6M12 18v-6M9 15h6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xs">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-hidden">
        {loading && (
          <div className="text-gray-40 absolute inset-0 z-5 flex items-center justify-center text-sm">
            Загрузка...
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="block h-full w-full transition-opacity duration-200"
          style={{ opacity: loading ? 0.3 : 1 }}
        />
      </div>
      <PdfPageControls
        fileName={shape.props.fileName}
        currentPage={displayPage}
        totalPages={totalPages}
        disabled={!canFlip}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
