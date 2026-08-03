import { useEffect, useMemo, useRef, useState } from 'react';
import { PowerPointViewerHandle, SlideCanvas, useViewerBuildingBlocks } from 'pptx-react-viewer';

import { useTranslation } from 'react-i18next';

import { useYjsContext } from '../../providers/YjsProvider';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';

import type { PresentationShape } from './PresentationShape';
import { PresentationControls } from './PresentationControls';

export const PresentationViewer = ({ shape }: { shape: PresentationShape }) => {
  const { token } = useYjsContext();
  const { t } = useTranslation('board');

  const [fetching, setFetching] = useState(false);
  const [content, setContent] = useState<Uint8Array | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);

  const slideNodeRef = useRef<HTMLDivElement | null>(null);
  const handle = useRef<PowerPointViewerHandle | null>(null);

  const { canvasProps, loading, error } = useViewerBuildingBlocks({
    content,
    canEdit: false,
    handle,

    onActiveSlideChange(index) {
      setCurrentSlide(index + 1);
    },
    onSlideCountChange(count) {
      setTotalSlides(count);
    },
  });

  const isLoading = fetching || loading;

  useEffect(() => {
    if (!shape.props.src || !token) return;

    let cancelled = false;

    setFetching(true);

    (async () => {
      const url = await resolveAssetUrl(shape.props.src, token);
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to fetch pptx (${res.status})`);
      }

      const buffer = await res.arrayBuffer();

      if (!cancelled) {
        setContent(new Uint8Array(buffer));
        setFetching(false);
      }
    })().catch((err) => {
      console.error(err);

      if (!cancelled) {
        setFetching(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [shape.props.src, token]);

  const slideScale = useMemo(() => {
    const baseWidth = 1280;
    const baseHeight = 720;

    return Math.min(shape.props.w / baseWidth, shape.props.h / baseHeight);
  }, [shape.props.w, shape.props.h]);

  const handlePageChange = (page: number) => {
    handle.current?.goTo(page - 1);
  };

  if (error) {
    return <div className="flex h-full items-center justify-center">{String(error)}</div>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="text-text-disabled absolute inset-0 z-10 flex items-center justify-center text-sm">
            {t('presentation.loading')}
          </div>
        )}

        {content && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ opacity: isLoading ? 0.3 : 1 }}
          >
            <div
              style={{
                width: Math.max(320, shape.props.w),
                height: Math.max(180, shape.props.h),
                position: 'relative',
              }}
            >
              <div
                ref={slideNodeRef}
                style={{
                  width: 1280,
                  height: 720,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) scale(${slideScale})`,
                  transformOrigin: 'center center',
                }}
              >
                <SlideCanvas {...canvasProps} mode="preview" />
              </div>
            </div>
          </div>
        )}
      </div>

      {!!totalSlides && (
        <PresentationControls
          fileName={shape.props.fileName ?? ''}
          currentPage={currentSlide}
          totalPages={totalSlides}
          disabled={isLoading}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
