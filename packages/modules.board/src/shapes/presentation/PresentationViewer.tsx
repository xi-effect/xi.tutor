import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PPTXViewer } from 'pptxviewjs';
import { useEditor, useValue } from '@ibodr/draw';

import { useYjsContext } from '../../providers/YjsContext';
import { loadPptxViewer } from '../../utils/loadPptxViewer';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { rasterPixelsForCssSize, zoomStepCeil } from '../../utils/rasterBudget';

import type { PresentationShape } from './PresentationShape';
import { PresentationControls } from './PresentationControls';
import { insertImage } from '../../features/pickAndInsertImage';

export const PresentationViewer = ({ shape }: { shape: PresentationShape }) => {
  const { token } = useYjsContext();
  const { t } = useTranslation('board');

  const editor = useEditor();
  const zoom = useValue('presentation-zoom', () => editor.getZoomLevel(), [editor]);
  const zoomStep = zoomStepCeil(zoom);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<PPTXViewer | null>(null);

  const [fetching, setFetching] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const isLoading = fetching;

  const resizeCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const viewer = viewerRef.current;

    if (!canvas || !container || !viewer) {
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
    canvas.width = pixels.width;
    canvas.height = pixels.height;

    try {
      await viewer.render(canvas, {
        quality: 'high',
      });
    } catch (err) {
      console.error(err);
      return;
    }

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, [zoomStep]);

  const resizeCanvasRef = useRef(resizeCanvas);
  resizeCanvasRef.current = resizeCanvas;

  useEffect(() => {
    void resizeCanvas();
  }, [resizeCanvas]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [resizeCanvas]);

  useEffect(() => {
    if (!canvasRef.current || !shape.props.src || !token) {
      return;
    }

    const canvas = canvasRef.current;
    let cancelled = false;

    async function load() {
      try {
        setFetching(true);
        setError(null);

        const url = await resolveAssetUrl(shape.props.src, token);

        const response = await fetch(url);

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
          canvas: canvasRef.current,
        });

        await viewer.loadFile(buffer);

        if (cancelled) {
          return;
        }

        viewerRef.current = viewer;

        setTotalSlides(viewer.getSlideCount());

        resizeCanvasRef.current();
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;

      viewerRef.current?.destroy();
      viewerRef.current = null;
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [shape.props.src, token]);

  const handlePageChange = async (page: number) => {
    const viewer = viewerRef.current;

    if (!viewer) {
      return;
    }

    await viewer.goToSlide(page - 1, canvasRef.current);

    setCurrentSlide(page);
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
