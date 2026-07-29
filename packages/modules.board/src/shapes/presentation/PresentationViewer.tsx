import { useEffect, useRef, useState } from 'react';
import { init } from 'pptx-preview';

import { useYjsContext } from '../../providers/YjsProvider';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import type { PresentationShape } from './PresentationShape';
import { PresentationControls } from './PresentationControls';
import { CONTROLS_HEIGHT } from './consts';

type PPTXPreviewerT = ReturnType<typeof init>;

export function PresentationViewer({ shape }: { shape: PresentationShape }) {
  const { token } = useYjsContext();

  const [loading, setLoading] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewerRef = useRef<PPTXPreviewerT | null>(null);
  const bufferRef = useRef<ArrayBuffer | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [totalSlides, setTotalSlides] = useState(0);

  const { src, w, h } = shape.props;

  const createPresentation = async (width: number, height: number) => {
    if (!containerRef.current || !bufferRef.current) return;

    try {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      const slideHeight = height - CONTROLS_HEIGHT;

      const previewer = init(containerRef.current!, {
        mode: 'slide',
        width: width,
        height: slideHeight,
      });

      previewerRef.current = previewer;

      await previewer.preview(bufferRef.current);

      setTotalSlides(previewer.slideCount);

      containerRef.current
        ?.querySelectorAll('.pptx-preview-wrapper-next, .pptx-preview-wrapper-pagination')
        .forEach((el) => el.remove());

      previewer.renderSingleSlide(currentSlide - 1);

      setLoading(false);
      setIsResizing(false);
    } catch (err) {
      console.error('[PresentationViewer] error:', err);
      setLoading(false);
      setIsResizing(false);
    }
  };

  useEffect(() => {
    if (!src || !token || !containerRef.current) return;

    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const url = await resolveAssetUrl(src, token);
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        bufferRef.current = buffer;

        await createPresentation(w, h);
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          console.error('[PresentationViewer]', err);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
      previewerRef.current?.destroy();
      previewerRef.current = null;

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [src, token]);

  useEffect(() => {
    if (!previewerRef.current || loading || !bufferRef.current) return;

    setIsResizing(true);

    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      createPresentation(w, h);
    }, 300);

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [w, h]);

  useEffect(() => {
    if (previewerRef.current && totalSlides > 0 && !loading && !isResizing) {
      previewerRef.current.renderSingleSlide(currentSlide - 1);
    }
  }, [currentSlide, totalSlides, loading, isResizing]);

  const nextSlide = () => {
    if (!previewerRef.current || currentSlide >= totalSlides || loading || isResizing) return;

    previewerRef.current.renderNextSlide();
    setCurrentSlide((v) => v + 1);
  };

  const prevSlide = () => {
    if (!previewerRef.current || currentSlide <= 1 || loading || isResizing) return;

    previewerRef.current.renderPreSlide();
    setCurrentSlide((v) => v - 1);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1" style={{ minHeight: 0 }}>
        <div ref={containerRef} className="h-full w-full" />
        {(loading || isResizing) && (
          <div className="text-gray-40 bg-gray-0 absolute inset-0 z-5 flex items-center justify-center text-sm">
            Загрузка...
          </div>
        )}
      </div>

      {totalSlides > 0 && !loading && !isResizing && (
        <div className="shrink-0 py-2">
          <PresentationControls
            current={currentSlide}
            total={totalSlides}
            onNext={nextSlide}
            onPrev={prevSlide}
          />
        </div>
      )}
    </div>
  );
}
