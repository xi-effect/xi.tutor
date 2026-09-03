import { useCallback, useEffect, useRef, useState } from 'react';
import type { PPTXViewer } from 'pptxviewjs';
import { cn } from '@xipkg/utils';
import { loadPptxViewer } from './loadPptxViewer';
import { PagePager } from './PagePager';
import { FilePreviewLoading } from './FilePreviewLoading';
import { PreviewZoomStage } from './PreviewZoomStage';

type PresentationPreviewProps = {
  blobUrl: string;
  isFullscreen: boolean;
  onError: () => void;
};

export const PresentationPreview = ({
  blobUrl,
  isFullscreen,
  onError,
}: PresentationPreviewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<PPTXViewer | null>(null);

  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);

  const resizeCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const viewer = viewerRef.current;
    if (!canvas || !container || !viewer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;

    canvas.width = Math.floor(width * window.devicePixelRatio);
    canvas.height = Math.floor(height * window.devicePixelRatio);
    await viewer.render(canvas, { quality: 'high' });
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    if (!blobUrl) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch(blobUrl);
        if (!response.ok) throw new Error(`Failed to fetch pptx (${response.status})`);
        const buffer = await response.arrayBuffer();
        if (cancelled) return;

        const { PPTXViewer } = await loadPptxViewer();
        if (cancelled) return;

        const viewer = new PPTXViewer({ canvas: canvasRef.current });
        viewerRef.current = viewer;
        await viewer.loadFile(buffer);
        if (cancelled) return;

        setTotalSlides(viewer.getSlideCount());
        setCurrentSlide(1);
        await resizeCanvas();
      } catch {
        if (!cancelled) onError();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [blobUrl, onError, resizeCanvas]);

  const handlePageChange = async (page: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    await viewer.goToSlide(page - 1, canvasRef.current);
    setCurrentSlide(page);
  };

  return (
    <div
      className={cn('bg-background-page relative min-h-0 w-full flex-1 overflow-hidden rounded-xl')}
    >
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <FilePreviewLoading isFullscreen={isFullscreen} className="min-h-0" />
        </div>
      ) : null}
      <div ref={containerRef} className="absolute inset-0 p-4 pb-14">
        <PreviewZoomStage enabled={isFullscreen} resetKey={currentSlide} className="h-full w-full">
          <canvas
            ref={canvasRef}
            className="block max-h-full max-w-full"
            style={{ opacity: loading ? 0.3 : 1 }}
          />
        </PreviewZoomStage>
      </div>
      {totalSlides > 0 ? (
        <PagePager
          currentPage={currentSlide}
          totalPages={totalSlides}
          disabled={loading}
          onPageChange={handlePageChange}
          className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2"
        />
      ) : null}
    </div>
  );
};
