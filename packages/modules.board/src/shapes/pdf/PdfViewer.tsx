import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from 'tldraw';
import { useCurrentUser } from 'common.services';
import * as pdfjsLib from 'pdfjs-dist';
import type { RenderTask } from 'pdfjs-dist';
import { useYjsContext } from '../../providers/YjsProvider';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { insertImage } from '../../features/pickAndInsertImage';
import { pdfDocCache } from './pdfDocCache';
import { PdfPageControls } from './PdfPageControls';
import type { PdfShape } from './PdfShape';
import { PDF_PAGES_VISIBLE_MAX, PDF_PAGES_VISIBLE_MIN } from './PdfShape';

// Используем CDN для worker файла, чтобы избежать проблем с бандлингом в продакшене
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/** Множитель разрешения рендера (supersampling). 1 = только dpr, 1.5–2 = выше качество, больше память/CPU. */
const PDF_RENDER_QUALITY_SCALE = 2;

type PdfViewerProps = {
  shape: PdfShape;
};

export const PdfViewer = ({ shape }: PdfViewerProps) => {
  const editor = useEditor();
  const { data: user } = useCurrentUser();
  const { pdfPagesMap, token, isReadonly } = useYjsContext();
  const isTutor = user?.default_layout === 'tutor';
  const userId = user?.id?.toString() ?? '';

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const renderTasksRef = useRef<(RenderTask | null)[]>([]);
  const loadKeyRef = useRef<string | null>(null);
  const hasRenderedOnceRef = useRef(false);

  const [localPage, setLocalPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Учитываем реальный размер контейнера (в т.ч. после зума/ресайза), чтобы не рендерить в 0×0 и не получать мыло
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setContainerSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { src, totalPages, currentPage: tutorPage, studentCanFlip } = shape.props;
  const pagesVisible = Math.min(
    PDF_PAGES_VISIBLE_MAX,
    Math.max(PDF_PAGES_VISIBLE_MIN, shape.props.pagesVisible ?? 1),
  );

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

    const loadKey = `${src}-${displayPage}-${pagesVisible}-${containerSize.w}-${containerSize.h}`;
    if (loadKeyRef.current !== loadKey) {
      loadKeyRef.current = loadKey;
      hasRenderedOnceRef.current = false;
    }

    let cancelled = false;
    const tasks: (RenderTask | null)[] = [];

    const render = async () => {
      try {
        if (!hasRenderedOnceRef.current) setLoading(true);
        const blobUrl = await resolveAssetUrl(src, token);
        if (cancelled) return;

        const pdfDoc = await pdfDocCache.get(blobUrl);
        if (cancelled) return;

        const displayW = containerSize.w;
        const displayHTotal = containerSize.h;
        if (displayW <= 0 || displayHTotal <= 0) return;

        const cellH = displayHTotal / pagesVisible;
        let anyRendered = false;

        for (let i = 0; i < renderTasksRef.current.length; i++) {
          const t = renderTasksRef.current[i];
          if (t) t.cancel();
        }
        renderTasksRef.current = [];

        for (let i = 0; i < pagesVisible; i++) {
          const pageNum = displayPage + i;
          if (pageNum > pdfDoc.numPages) break;

          const canvas = canvasRefs.current[i];
          if (!canvas) continue;

          const page = await pdfDoc.getPage(pageNum);
          if (cancelled) return;

          const dpr = window.devicePixelRatio || 1;
          const vp1 = page.getViewport({ scale: 1 });
          const pageW = vp1.width;
          const pageH = vp1.height;
          const baseScale = Math.min(displayW / pageW, cellH / pageH);
          const scale = baseScale * dpr * PDF_RENDER_QUALITY_SCALE;

          const viewport = page.getViewport({ scale });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const fittedW = pageW * baseScale;
          const fittedH = pageH * baseScale;
          canvas.style.width = `${fittedW}px`;
          canvas.style.height = `${fittedH}px`;

          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          const renderTask = page.render({
            canvasContext: ctx,
            viewport,
            intent: 'print',
          });
          renderTasksRef.current[i] = renderTask;
          tasks.push(renderTask);

          await renderTask.promise;
          anyRendered = true;
          if (cancelled) return;
        }

        if (!cancelled && anyRendered) {
          hasRenderedOnceRef.current = true;
          setLoading(false);
        }
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
      renderTasksRef.current.forEach((t) => {
        if (t) t.cancel();
      });
      renderTasksRef.current = [];
    };
  }, [src, token, displayPage, pagesVisible, shape.props.w, containerSize.w, containerSize.h]);

  const handleExtractPage = useCallback(async () => {
    if (loading || !token) return;

    const bounds = editor.getShapePageBounds(shape.id);
    if (!bounds) return;

    const canvases: HTMLCanvasElement[] = [];
    for (let i = 0; i < pagesVisible; i++) {
      if (displayPage + i > totalPages) break;
      const c = canvasRefs.current[i];
      if (c && c.width > 0 && c.height > 0) canvases.push(c);
    }
    if (canvases.length === 0) return;

    let blob: Blob | null;
    const baseName = shape.props.fileName?.replace(/\.pdf$/i, '') || 'pdf';

    if (canvases.length === 1) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvases[0].toBlob(resolve, 'image/png');
      });
    } else {
      const first = canvases[0];
      const commonW = first.width;
      let combinedH = 0;
      const heights: number[] = [];
      for (let i = 0; i < canvases.length; i++) {
        const h = (canvases[i].height / canvases[i].width) * commonW;
        heights.push(h);
        combinedH += h;
      }
      const offscreen = document.createElement('canvas');
      offscreen.width = commonW;
      offscreen.height = Math.round(combinedH);
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;
      let y = 0;
      for (let i = 0; i < canvases.length; i++) {
        const c = canvases[i];
        const h = heights[i];
        ctx.drawImage(c, 0, 0, c.width, c.height, 0, y, commonW, h);
        y += h;
      }
      blob = await new Promise<Blob | null>((resolve) => {
        offscreen.toBlob(resolve, 'image/png');
      });
    }

    if (!blob) return;

    const pageRange =
      canvases.length === 1
        ? `p${displayPage}`
        : `p${displayPage}-${displayPage + canvases.length - 1}`;
    const file = new File([blob], `${baseName}_${pageRange}.png`, { type: 'image/png' });

    const pdfH = bounds.h;
    const imageH = pdfH;
    let imageW: number;
    if (canvases.length === 1) {
      imageW = (canvases[0].width / canvases[0].height) * pdfH;
    } else {
      const commonW = canvases[0].width;
      let combinedH = 0;
      for (let i = 0; i < canvases.length; i++) {
        combinedH += (canvases[i].height / canvases[i].width) * commonW;
      }
      imageW = (commonW / combinedH) * pdfH;
    }
    const gap = 24;

    await insertImage(editor, file, token, {
      x: bounds.maxX + gap,
      y: bounds.y,
      w: imageW,
      h: imageH,
    });
  }, [
    loading,
    token,
    shape.id,
    shape.props.fileName,
    displayPage,
    totalPages,
    pagesVisible,
    editor,
  ]);

  const handlePagesVisibleChange = useCallback(
    (n: number) => {
      editor.updateShape<PdfShape>({
        id: shape.id,
        type: 'pdf',
        props: { pagesVisible: n },
      });
    },
    [editor, shape.id],
  );

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
      <div ref={containerRef} className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {loading && (
          <div className="text-gray-40 absolute inset-0 z-5 flex items-center justify-center text-sm">
            Загрузка...
          </div>
        )}
        {Array.from({ length: pagesVisible }, (_, i) => {
          const pageNum = displayPage + i;
          const inRange = pageNum <= totalPages;
          return (
            <div
              key={i}
              className="flex min-h-0 flex-1 items-center justify-center"
              style={{ opacity: loading ? 0.3 : 1 }}
            >
              {inRange ? (
                <canvas
                  ref={(el) => {
                    canvasRefs.current[i] = el;
                  }}
                  className="block max-h-full max-w-full transition-opacity duration-200"
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <PdfPageControls
        fileName={shape.props.fileName}
        currentPage={displayPage}
        totalPages={totalPages}
        disabled={!canFlip}
        onPageChange={handlePageChange}
        onExtractPage={!isReadonly && !loading ? handleExtractPage : undefined}
        pagesVisible={pagesVisible}
        onPagesVisibleChange={!isReadonly ? handlePagesVisibleChange : undefined}
      />
    </div>
  );
};
