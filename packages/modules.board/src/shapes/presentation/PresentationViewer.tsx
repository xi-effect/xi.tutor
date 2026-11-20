import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PPTXViewer } from 'pptxviewjs';
import { useEditor, useValue } from '@ibodr/draw';

import { useYjsContext } from '../../providers/YjsContext';
import { loadPptxViewer } from '../../utils/loadPptxViewer';
import { createPresentationPainter } from './presentationPainter';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { rasterPixelsForCssSize, zoomStepCeil } from '../../utils/rasterBudget';

import type { PresentationShape } from './PresentationShape';
import { PresentationControls } from './PresentationControls';
import { reportBoardProblem } from '../../utils/boardProblem';
import { insertImage } from '../../features/pickAndInsertImage';

export const PresentationViewer = ({ shape }: { shape: PresentationShape }) => {
  const { token } = useYjsContext();
  const { t } = useTranslation('board');

  const editor = useEditor();
  const zoomStep = useValue('presentation-zoom-step', () => zoomStepCeil(editor.getZoomLevel()), [
    editor,
  ]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const painterRef = useRef<ReturnType<typeof createPresentationPainter> | null>(null);
  const requestedPage = useRef(1);

  const [fetching, setFetching] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const isLoading = fetching;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const painter = painterRef.current;

    if (!canvas || !container || !painter) {
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width < 1 || height < 1) {
      return;
    }

    const pixels = rasterPixelsForCssSize(width, height, zoomStep, window.devicePixelRatio || 1, {
      supersample: 2,
    });
    painter.request({
      width,
      height,
      pixelWidth: pixels.width,
      pixelHeight: pixels.height,
      page: requestedPage.current,
    });
  }, [zoomStep]);

  const resizeCanvasRef = useRef(resizeCanvas);
  resizeCanvasRef.current = resizeCanvas;

  useEffect(() => {
    void resizeCanvas();
  }, [resizeCanvas]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      resizeCanvasRef.current();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !shape.props.src || !token) {
      return;
    }

    const canvas = canvasRef.current;
    let cancelled = false;
    const controller = new AbortController();
    let ownedViewer: PPTXViewer | null = null;
    let painter: ReturnType<typeof createPresentationPainter> | null = null;
    requestedPage.current = 1;
    setCurrentSlide(1);
    setTotalSlides(0);

    async function load() {
      try {
        setFetching(true);
        setError(null);

        const url = await resolveAssetUrl(shape.props.src, token);

        if (cancelled) return;
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Failed to fetch pptx (${response.status})`);
        }

        const buffer = await response.arrayBuffer();

        if (cancelled) {
          return;
        }

        const { PPTXViewer } = await loadPptxViewer();

        if (cancelled) {
          return;
        }

        const viewer = new PPTXViewer({
          canvas: null,
          autoChartRerenderDelayMs: 0,
        });

        ownedViewer = viewer;
        await viewer.loadFile(buffer);

        if (cancelled) {
          return;
        }

        painter = createPresentationPainter(
          viewer,
          canvas,
          (page) => {
            setCurrentSlide(page);
          },
          (err) => reportBoardProblem('presentation-render', err, { shapeId: shape.id }),
        );
        painterRef.current = painter;

        setTotalSlides(viewer.getSlideCount());

        resizeCanvasRef.current();
      } catch (err) {
        if (!cancelled) {
          reportBoardProblem('presentation-load', err, { shapeId: shape.id });
          setError(err as Error);
        }
      } finally {
        if (!painter) ownedViewer?.destroy();
        if (!cancelled) {
          setFetching(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;

      controller.abort();
      painter?.dispose();
      if (painterRef.current === painter) painterRef.current = null;
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [shape.props.src, token, shape.id]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalSlides || !painterRef.current) return;
    requestedPage.current = page;
    resizeCanvasRef.current();
  };

  const handleExtractPage = useCallback(async () => {
    if (isLoading || !token) return;

    const bounds = editor.getShapePageBounds(shape.id);
    if (!bounds) return;

    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    if (!blob) return;

    const baseName = shape.props.fileName?.replace(/\.pptx?$/i, '') || 'presentation';
    const file = new File([blob], `${baseName}_slide${currentSlide}.png`, {
      type: 'image/png',
    });

    const imageH = bounds.h;
    const imageW = (canvas.width / canvas.height) * imageH;
    const gap = 24;

    await insertImage(editor, file, token, {
      x: bounds.maxX + gap,
      y: bounds.y,
      w: imageW,
      h: imageH,
    });
  }, [isLoading, token, shape.id, shape.props.fileName, currentSlide, editor]);

  if (error) {
    return <div className="flex h-full items-center justify-center">{String(error)}</div>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="text-text-disabled absolute inset-0 z-10 flex items-center justify-center text-sm">
            {t('presentation.loading')}
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="block"
          style={{
            opacity: isLoading ? 0.3 : 1,
          }}
        />
      </div>

      {!!totalSlides && (
        <PresentationControls
          fileName={shape.props.fileName ?? ''}
          currentPage={currentSlide}
          totalPages={totalSlides}
          disabled={isLoading}
          onPageChange={handlePageChange}
          onExtractPage={handleExtractPage}
        />
      )}
    </div>
  );
};
