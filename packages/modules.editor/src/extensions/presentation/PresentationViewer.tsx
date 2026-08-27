import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PPTXViewer } from 'pptxviewjs';
import { loadPptxViewer } from '../../utils/loadPptxViewer';
import { PageControls } from '../media/PageControls';

type PresentationViewerProps = {
  blobUrl: string;
  fileName: string;
  isReadOnly?: boolean;
  onExtractPage?: (blob: Blob, slide: number) => void;
};

export const PresentationViewer = ({
  blobUrl,
  fileName,
  isReadOnly,
  onExtractPage,
}: PresentationViewerProps) => {
  const { t } = useTranslation('editor');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<PPTXViewer | null>(null);

  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resizeCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const viewer = viewerRef.current;
    if (!canvas || !container || !viewer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
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
    if (!canvasRef.current || !blobUrl) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

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
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(t('presentation.renderError'));
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
  }, [blobUrl, resizeCanvas, t]);

  const handlePageChange = async (page: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    await viewer.goToSlide(page - 1, canvasRef.current);
    setCurrentSlide(page);
  };

  const handleExtract = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || !onExtractPage) return;
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    if (blob) onExtractPage(blob, currentSlide);
  }, [onExtractPage, currentSlide]);

  if (error) {
    return (
      <div className="text-text-disabled flex h-full w-full items-center justify-center text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-hidden">
        {loading && (
          <div className="text-text-disabled absolute inset-0 z-10 flex items-center justify-center text-sm">
            {t('presentation.loading')}
          </div>
        )}
        <canvas ref={canvasRef} className="block" style={{ opacity: loading ? 0.3 : 1 }} />
      </div>
      {!!totalSlides && (
        <PageControls
          fileName={fileName}
          currentPage={currentSlide}
          totalPages={totalSlides}
          disabled={loading}
          onPageChange={handlePageChange}
          onExtractPage={!isReadOnly && !loading ? handleExtract : undefined}
          extractTitle={t('presentation.extractPage')}
        />
      )}
    </div>
  );
};
