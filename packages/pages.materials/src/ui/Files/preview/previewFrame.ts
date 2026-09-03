import { useLayoutEffect, useState } from 'react';

export const PREVIEW_MODAL_MAX_WIDTH = 1280;
export const PREVIEW_MODAL_VIEWPORT_GUTTER = 48;

export const PREVIEW_AUDIO_FRAME_CLASS = 'w-[min(720px,calc(100vw-32px))] rounded-3xl';

export const PREVIEW_STAGE_CLASS = 'flex min-h-0 flex-1 flex-col';

const fallbackWindowSize = {
  width: PREVIEW_MODAL_MAX_WIDTH,
  height: (PREVIEW_MODAL_MAX_WIDTH * 9) / 16,
  viewportWidth: PREVIEW_MODAL_MAX_WIDTH,
  viewportHeight: (PREVIEW_MODAL_MAX_WIDTH * 9) / 16,
};

export const getPreviewWindowSize = () => {
  if (typeof window === 'undefined') return fallbackWindowSize;

  const width = Math.min(
    PREVIEW_MODAL_MAX_WIDTH,
    window.innerWidth - PREVIEW_MODAL_VIEWPORT_GUTTER,
    ((window.innerHeight - PREVIEW_MODAL_VIEWPORT_GUTTER) * 16) / 9,
  );

  return {
    width,
    height: (width * 9) / 16,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
};

export const usePreviewWindowSize = () => {
  const [size, setSize] = useState(fallbackWindowSize);

  useLayoutEffect(() => {
    const update = () => setSize(getPreviewWindowSize());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
};
