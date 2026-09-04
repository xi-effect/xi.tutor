import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { clampPreviewZoom, PREVIEW_ZOOM_MIN, stepPreviewZoom } from './previewZoom';

type PreviewZoom = {
  scale: number;
  x: number;
  y: number;
};

const INITIAL_ZOOM: PreviewZoom = { scale: 1, x: 0, y: 0 };

type Pivot = { x: number; y: number; rect: DOMRect };

type ApplyScaleOptions = {
  smooth?: boolean;
};

export const usePreviewZoom = (enabled: boolean, resetKey?: string | number) => {
  const [zoom, setZoom] = useState<PreviewZoom>(INITIAL_ZOOM);
  const [isPanning, setIsPanning] = useState(false);
  const [smooth, setSmooth] = useState(true);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const commitZoom = (next: PreviewZoom) => {
    zoomRef.current = next;
    return next;
  };

  useEffect(() => {
    setSmooth(false);
    setZoom(commitZoom(INITIAL_ZOOM));
    dragRef.current = null;
    setIsPanning(false);
  }, [enabled, resetKey]);

  const applyScale = useCallback(
    (
      nextScale: number | ((current: number) => number),
      pivot?: Pivot,
      options?: ApplyScaleOptions,
    ) => {
      setSmooth(options?.smooth !== false);
      setZoom((prev) => {
        const scale = clampPreviewZoom(
          typeof nextScale === 'function' ? nextScale(prev.scale) : nextScale,
        );
        if (scale <= PREVIEW_ZOOM_MIN) return commitZoom(INITIAL_ZOOM);
        if (!pivot || prev.scale === scale) return commitZoom({ ...prev, scale });

        const cx = pivot.x - pivot.rect.left - pivot.rect.width / 2;
        const cy = pivot.y - pivot.rect.top - pivot.rect.height / 2;
        const ratio = scale / prev.scale;
        return commitZoom({
          scale,
          x: cx - (cx - prev.x) * ratio,
          y: cy - (cy - prev.y) * ratio,
        });
      });
    },
    [],
  );

  const zoomIn = useCallback(
    (pivot?: Pivot) => applyScale((current) => stepPreviewZoom(current, 1), pivot),
    [applyScale],
  );

  const zoomOut = useCallback(
    (pivot?: Pivot) => applyScale((current) => stepPreviewZoom(current, -1), pivot),
    [applyScale],
  );

  const reset = useCallback(() => {
    setSmooth(true);
    setZoom(commitZoom(INITIAL_ZOOM));
    dragRef.current = null;
    setIsPanning(false);
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || zoomRef.current.scale <= PREVIEW_ZOOM_MIN) return;
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: zoomRef.current.x,
        originY: zoomRef.current.y,
      };
      setIsPanning(true);
    },
    [enabled],
  );

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setZoom((prev) =>
      commitZoom({
        ...prev,
        x: drag.originX + (event.clientX - drag.startX),
        y: drag.originY + (event.clientY - drag.startY),
      }),
    );
  }, []);

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return {
    zoom,
    isPanning,
    smooth,
    zoomIn,
    zoomOut,
    reset,
    applyScale,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};
