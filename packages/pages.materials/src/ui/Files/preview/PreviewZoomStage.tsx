import { type ReactNode, type Ref, useCallback, useEffect, useRef } from 'react';
import { cn } from '@xipkg/utils';
import { PREVIEW_ZOOM_MIN, wheelPreviewZoom } from './previewZoom';
import { PreviewZoomControls } from './PreviewZoomControls';
import { usePreviewZoom } from './usePreviewZoom';

type PreviewZoomStageProps = {
  enabled: boolean;
  resetKey?: string | number;
  viewportRef?: Ref<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
};

const assignRef = (ref: Ref<HTMLDivElement | null> | undefined, node: HTMLDivElement | null) => {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  ref.current = node;
};

export const PreviewZoomStage = ({
  enabled,
  resetKey,
  viewportRef,
  className,
  children,
}: PreviewZoomStageProps) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const {
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
  } = usePreviewZoom(enabled, resetKey);
  const dragging = zoom.scale > PREVIEW_ZOOM_MIN;

  const setNode = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      assignRef(viewportRef, node);
    },
    [viewportRef],
  );

  useEffect(() => {
    if (!enabled) return;
    const node = nodeRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      const pivot = { x: event.clientX, y: event.clientY, rect };
      applyScale((current) => wheelPreviewZoom(current, event.deltaY, event.deltaMode), pivot, {
        smooth: false,
      });
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [applyScale, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomIn();
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        zoomOut();
      } else if (event.key === '0') {
        event.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, reset, zoomIn, zoomOut]);

  return (
    <div
      ref={setNode}
      className={cn(
        'relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden',
        enabled && 'select-none',
        enabled && dragging ? 'cursor-grab active:cursor-grabbing' : null,
        className,
      )}
      style={{ touchAction: enabled ? 'none' : undefined }}
      onPointerDown={enabled ? onPointerDown : undefined}
      onPointerMove={enabled ? onPointerMove : undefined}
      onPointerUp={enabled ? onPointerUp : undefined}
      onPointerCancel={enabled ? onPointerUp : undefined}
    >
      <div
        className="relative z-0"
        style={{
          transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
          transformOrigin: 'center center',
          transition:
            isPanning || !smooth ? 'none' : 'transform 160ms cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
      >
        {children}
      </div>
      {enabled ? (
        <PreviewZoomControls
          scale={zoom.scale}
          onZoomIn={() => zoomIn()}
          onZoomOut={() => zoomOut()}
          onReset={reset}
        />
      ) : null}
    </div>
  );
};
