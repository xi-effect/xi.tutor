import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, useValue } from '@ibodr/draw';
import { isPublicAssetSrc, useCurrentUser } from 'common.services';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useYjsContext } from '../../providers/YjsContext';
import { resolveAssetUrl, retainBlobUrl } from '../../utils/resolveAssetUrl';
import { insertImage } from '../../features/pickAndInsertImage';
import {
  OcrImageLoadError,
  recognizeBoardPdfPageText,
  useOcrProcessingStore,
  type OcrLanguage,
} from '../../ocr';
import { pdfDocCache } from './pdfDocCache';
import { renderPdfSliceToPngBlob } from './fitPdfPage';
import { zoomStepCeil } from '../../utils/rasterBudget';
import { PdfPageControls } from './PdfPageControls';
import type { PdfShape } from './PdfShape';
import { PDF_PAGES_VISIBLE_MAX, PDF_PAGES_VISIBLE_MIN } from './PdfShape';
import { RecognizePrintedTextControl } from '../../ui/components/toolbar/RecognizeTextMenu';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { reportBoardProblem } from '../../utils/boardProblem';

import { PdfPageImage } from './PdfPageImage';

type PdfViewerProps = {
  shape: PdfShape;
};

export const PdfViewer = ({ shape }: PdfViewerProps) => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const { data: user } = useCurrentUser();
  const { pdfPagesMap, token, isReadonly } = useYjsContext();
  const isTutor = user?.default_layout === 'tutor';
  const userId = user?.id?.toString() ?? '';

  const containerRef = useRef<HTMLDivElement>(null);

  const [localPage, setLocalPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Учитываем реальный размер контейнера (в т.ч. после ресайза), округляем px — без лишних перерендеров
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

  const { src, totalPages, currentPage: tutorPage, studentCanFlip } = shape.props;
  const zoomStep = useValue('pdf-zoom-step', () => zoomStepCeil(editor.getZoomLevel()), [editor]);
  const pagesVisible = Math.min(
    PDF_PAGES_VISIBLE_MAX,
    Math.max(PDF_PAGES_VISIBLE_MIN, shape.props.pagesVisible ?? 1),
  );

  const displayPage = !isTutor && !studentCanFlip ? tutorPage : localPage;
  const readyPages = useRef(new Set<number>());
  useEffect(() => {
    readyPages.current.clear();
    setLoading(true);
  }, [src, displayPage, pagesVisible]);

  const canFlip = isTutor || studentCanFlip;

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

  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!src || (!token && !isPublicAssetSrc(src))) {
      setPdfDoc(null);
      return;
    }

    setError(null);
    setLoading(true);
    let cancelled = false;
    let heldUrl: string | null = null;
    let releaseBlob: (() => void) | null = null;

    const releaseHeld = () => {
      if (!heldUrl) return;
      pdfDocCache.release(heldUrl);
      releaseBlob?.();
      heldUrl = null;
      releaseBlob = null;
    };

    const load = async () => {
      try {
        const blobUrl = await resolveAssetUrl(src, token);
        if (cancelled) return;
        releaseBlob = retainBlobUrl(blobUrl);
        const doc = await pdfDocCache.get(blobUrl);
        if (cancelled) {
          pdfDocCache.release(blobUrl);
          releaseBlob?.();
          return;
        }
        heldUrl = blobUrl;
        setSourceUrl(blobUrl);
        setPdfDoc(doc);
      } catch (err) {
        releaseBlob?.();
        if (cancelled) return;
        reportBoardProblem('pdf-load', err, { shapeId: shape.id });
        setError(i18n.t('pdf.renderError', { ns: 'board' }));
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      setSourceUrl(null);
      releaseHeld();
      setPdfDoc(null);
    };
  }, [src, token, shape.id]);

  const renderSharpSlice = useCallback(
    async (pageCount: number) => {
      if (!src || (!token && !isPublicAssetSrc(src))) return null;
      const cellW = containerSize.w || shape.props.w;
      const cellH = (containerSize.h || shape.props.h) / pagesVisible;
      if (cellW <= 0 || cellH <= 0) return null;

      const blobUrl = await resolveAssetUrl(src, token);
      const releaseBlob = retainBlobUrl(blobUrl);
      let pdfDoc: PDFDocumentProxy | null = null;
      try {
        pdfDoc = await pdfDocCache.get(blobUrl);
        return await renderPdfSliceToPngBlob({
          pdfDoc,
          startPage: displayPage,
          pageCount,
          cellWidth: cellW,
          cellHeight: cellH,
          zoom: Math.max(editor.getZoomLevel(), 1),
          dpr: window.devicePixelRatio || 1,
        });
      } finally {
        if (pdfDoc) pdfDocCache.release(blobUrl);
        releaseBlob();
      }
    },
    [
      containerSize.h,
      containerSize.w,
      displayPage,
      pagesVisible,
      shape.props.h,
      shape.props.w,
      src,
      token,
      editor,
    ],
  );

  const handleExtractPage = useCallback(async () => {
    if (loading || !token) return;

    const bounds = editor.getShapePageBounds(shape.id);
    if (!bounds) return;

    const visibleCount = Math.min(pagesVisible, Math.max(0, totalPages - displayPage + 1));
    if (visibleCount <= 0) return;

    const blob = await renderSharpSlice(visibleCount);
    if (!blob) return;

    const bitmap = await createImageBitmap(blob);
    const imageH = bounds.h;
    const imageW = (bitmap.width / bitmap.height) * imageH;
    bitmap.close();

    const baseName = shape.props.fileName?.replace(/\.pdf$/i, '') || 'pdf';
    const pageRange =
      visibleCount === 1 ? `p${displayPage}` : `p${displayPage}-${displayPage + visibleCount - 1}`;
    const file = new File([blob], `${baseName}_${pageRange}.png`, { type: 'image/png' });
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
    renderSharpSlice,
  ]);

  const isOcrProcessing = useOcrProcessingStore((state) => state.isProcessing(shape.id));

  const getCurrentPageBlob = useCallback(async () => {
    const blob = await renderSharpSlice(1);
    if (!blob) throw new OcrImageLoadError('Current PDF page is not rendered');
    return blob;
  }, [renderSharpSlice]);

  const handleRecognizePrintedText = useCallback(
    (language: OcrLanguage) => {
      void recognizeBoardPdfPageText(editor, shape.id, getCurrentPageBlob, language);
    },
    [editor, getCurrentPageBlob, shape.id],
  );

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
      <div className="text-text-disabled flex h-full w-full flex-col items-center justify-center gap-2">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-text-disabled">
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
          <div className="text-text-disabled absolute inset-0 z-5 flex items-center justify-center text-sm">
            {t('pdf.loading')}
          </div>
        )}
        {isOcrProcessing && (
          <div className="bg-background-surface/70 pointer-events-none absolute inset-0 z-6 flex items-center justify-center">
            <span className="text-text-primary text-xs select-none">{t('ocr.processing')}</span>
          </div>
        )}
        {Array.from({ length: pagesVisible }, (_, i) => {
          const pageNum = displayPage + i;
          const inRange = pageNum <= totalPages;
          return (
            <div
              key={`${src}:${displayPage}:${pagesVisible}:${pageNum}`}
              className="flex min-h-0 flex-1 items-center justify-center"
              style={{ opacity: loading ? 0.3 : 1 }}
            >
              {inRange && sourceUrl && pdfDoc ? (
                <PdfPageImage
                  source={sourceUrl}
                  page={pageNum}
                  width={containerSize.w}
                  height={containerSize.h / pagesVisible}
                  zoom={zoomStep}
                  dpr={window.devicePixelRatio || 1}
                  onReady={() => {
                    readyPages.current.add(pageNum);
                    if (
                      readyPages.current.size >=
                      Math.min(pagesVisible, totalPages - displayPage + 1)
                    )
                      setLoading(false);
                  }}
                  onError={(err) => {
                    reportBoardProblem('pdf-render', err, { shapeId: shape.id });
                    setError(i18n.t('pdf.renderError', { ns: 'board' }));
                    setLoading(false);
                  }}
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
        recognizeControl={
          !isReadonly && !loading ? (
            <RecognizePrintedTextControl
              processingId={shape.id}
              onRecognize={handleRecognizePrintedText}
              title={t('pdf.recognizePrintedText')}
            />
          ) : undefined
        }
        pagesVisible={pagesVisible}
        onPagesVisibleChange={!isReadonly ? handlePagesVisibleChange : undefined}
      />
    </div>
  );
};
