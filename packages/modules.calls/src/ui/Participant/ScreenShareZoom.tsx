import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { isTrackReference } from '@livekit/components-core';
import { VideoTrack } from '../shared';
import { ZoomIn, ZoomOut } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Slider } from '@xipkg/slider';
import { cn } from '@xipkg/utils';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;
const THUMBNAIL_MAX_WIDTH = 240;
const THUMBNAIL_MAX_HEIGHT = 135;

type VideoDimensions = { width: number; height: number };

type ScreenShareZoomProps = {
  trackRef: TrackReferenceOrPlaceholder;
  children: React.ReactNode;
  className?: string;
};

/**
 * Оборачивает демонстрацию экрана в фокусе: кнопка «Приблизить» в правом нижнем углу,
 * по клику — панель с миниатюрой, перетаскиваемой областью просмотра и контролами зума (как в Discord).
 */
export function ScreenShareZoom({ trackRef, children, className }: ScreenShareZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<VideoDimensions | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const dragRef = useRef<{
    startPanX: number;
    startPanY: number;
    startClientX: number;
    startClientY: number;
  } | null>(null);

  const updateVideoDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const video = containerRef.current.querySelector('video');
    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      setVideoDimensions({ width: video.videoWidth, height: video.videoHeight });
    }
  }, []);

  const updateContainerSize = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setContainerSize({ width: rect.width, height: rect.height });
  }, []);

  useEffect(() => {
    updateVideoDimensions();
    updateContainerSize();
    const video = containerRef.current?.querySelector('video');
    if (video) {
      video.addEventListener('loadedmetadata', updateVideoDimensions);
      video.addEventListener('resize', updateVideoDimensions);
    }
    const ro = containerRef.current ? new ResizeObserver(updateContainerSize) : null;
    if (containerRef.current) ro?.observe(containerRef.current);
    return () => {
      video?.removeEventListener('loadedmetadata', updateVideoDimensions);
      video?.removeEventListener('resize', updateVideoDimensions);
      ro?.disconnect();
    };
  }, [updateVideoDimensions, updateContainerSize]);

  useEffect(() => {
    if (!videoDimensions || !containerSize) return;
    const maxPanX = Math.max(0, videoDimensions.width - containerSize.width / zoomLevel);
    const maxPanY = Math.max(0, videoDimensions.height - containerSize.height / zoomLevel);
    setPanX((p) => Math.min(p, maxPanX));
    setPanY((p) => Math.min(p, maxPanY));
  }, [zoomLevel, videoDimensions, containerSize]);

  const handleZoomIn = useCallback(() => {
    setIsPanelOpen(true);
    setZoomLevel((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => {
      const next = Math.max(MIN_ZOOM, z - ZOOM_STEP);
      if (next <= MIN_ZOOM) setIsPanelOpen(false);
      return next;
    });
  }, []);

  const handleSliderChange = useCallback((value: number[]) => {
    const v = value[0] ?? MIN_ZOOM;
    setZoomLevel(v);
    if (v <= MIN_ZOOM) setIsPanelOpen(false);
    else setIsPanelOpen(true);
  }, []);

  // Перетаскивание синей области на миниатюре: двигаем область просмотра
  const thumbScaleRef = useRef(0);
  if (videoDimensions && containerSize) {
    const scaleW = THUMBNAIL_MAX_WIDTH / videoDimensions.width;
    const scaleH = THUMBNAIL_MAX_HEIGHT / videoDimensions.height;
    thumbScaleRef.current = Math.min(scaleW, scaleH);
  }

  const handleViewportRectPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (!videoDimensions || !containerSize) return;
      dragRef.current = {
        startPanX: panX,
        startPanY: panY,
        startClientX: e.clientX,
        startClientY: e.clientY,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [panX, panY, videoDimensions, containerSize],
  );

  const handleViewportRectPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || !videoDimensions || !containerSize) return;
      const scale = thumbScaleRef.current;
      if (scale <= 0) return;
      const maxPanX = Math.max(0, videoDimensions.width - containerSize.width / zoomLevel);
      const maxPanY = Math.max(0, videoDimensions.height - containerSize.height / zoomLevel);
      const deltaX = (e.clientX - dragRef.current.startClientX) / scale;
      const deltaY = (e.clientY - dragRef.current.startClientY) / scale;
      const newPanX = Math.max(0, Math.min(maxPanX, dragRef.current.startPanX + deltaX));
      const newPanY = Math.max(0, Math.min(maxPanY, dragRef.current.startPanY + deltaY));
      setPanX(newPanX);
      setPanY(newPanY);
    },
    [videoDimensions, containerSize, zoomLevel],
  );

  const handleViewportRectPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const isZoomed = zoomLevel > MIN_ZOOM;
  const showZoomButton = !isPanelOpen;
  const showPanel = isPanelOpen;

  const zoomTransform =
    videoDimensions && isZoomed && containerSize
      ? `scale(${zoomLevel}) translate(${-panX * zoomLevel}px, ${-panY * zoomLevel}px)`
      : undefined;

  const zoomableStyle: React.CSSProperties =
    videoDimensions && zoomTransform
      ? {
          position: 'absolute',
          left: 0,
          top: 0,
          width: videoDimensions.width,
          height: videoDimensions.height,
          transformOrigin: '0 0',
          transform: zoomTransform,
        }
      : {
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        };

  // Миниатюра: масштаб под максимальные размеры
  let thumbScale = 1;
  let thumbWidth = videoDimensions?.width ?? 0;
  let thumbHeight = videoDimensions?.height ?? 0;
  if (videoDimensions) {
    const scaleW = THUMBNAIL_MAX_WIDTH / videoDimensions.width;
    const scaleH = THUMBNAIL_MAX_HEIGHT / videoDimensions.height;
    thumbScale = Math.min(scaleW, scaleH);
    thumbWidth = videoDimensions.width * thumbScale;
    thumbHeight = videoDimensions.height * thumbScale;
  }

  const viewportRect =
    containerSize && videoDimensions && thumbScale
      ? {
          left: (panX / videoDimensions.width) * thumbWidth,
          top: (panY / videoDimensions.height) * thumbHeight,
          width: (containerSize.width / zoomLevel / videoDimensions.width) * thumbWidth,
          height: (containerSize.height / zoomLevel / videoDimensions.height) * thumbHeight,
        }
      : null;

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden rounded-2xl', className)}
    >
      <div className="absolute top-0 left-0 h-full w-full" style={zoomableStyle}>
        {children}
      </div>

      {/* Кнопка лупы — только когда панель закрыта */}
      {showZoomButton && (
        <Button
          type="button"
          size="icon"
          variant="none"
          onClick={handleZoomIn}
          className="bg-gray-0/90 hover:bg-gray-0 absolute right-2 bottom-2 z-20 h-8 w-8 rounded-lg backdrop-blur"
          aria-label="Приблизить"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      )}

      {/* Панель зума (миниатюра + слайдер + кнопки) — только после нажатия ZoomIn */}
      {showPanel && (
        <div className="border-gray-20 bg-brand-20/95 absolute right-1 bottom-1 z-20 w-[260px] rounded-xl border p-1 shadow-lg backdrop-blur">
          {/* Миниатюра с областью просмотра */}
          <div className="relative mb-2 overflow-hidden rounded-lg bg-black">
            {isTrackReference(trackRef) && trackRef.publication?.track && (
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: thumbWidth,
                  height: thumbHeight,
                  margin: '0 auto',
                }}
              >
                <VideoTrack
                  className="h-full w-full object-contain"
                  trackRef={trackRef}
                  style={{ width: thumbWidth, height: thumbHeight, objectFit: 'contain' }}
                />
                {viewportRect && (
                  <div
                    aria-label="Область просмотра, перетащите для перемещения"
                    className="border-brand-80 bg-brand-80/30 absolute cursor-grab rounded border-2 active:cursor-grabbing"
                    style={{
                      left: viewportRect.left,
                      top: viewportRect.top,
                      width: Math.max(8, viewportRect.width),
                      height: Math.max(8, viewportRect.height),
                    }}
                    onPointerDown={handleViewportRectPointerDown}
                    onPointerMove={handleViewportRectPointerMove}
                    onPointerUp={handleViewportRectPointerUp}
                    onPointerCancel={handleViewportRectPointerUp}
                  />
                )}
              </div>
            )}
          </div>

          {/* Контролы: ZoomOut — слайдер — ZoomIn */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={handleZoomOut}
              disabled={zoomLevel <= MIN_ZOOM}
              className="group fill-gray-0 h-8 w-8 shrink-0 rounded-lg disabled:pointer-events-none disabled:opacity-50"
              aria-label="Уменьшить"
            >
              <ZoomOut className="text-gray-80 group-hover:text-gray-0 group-active:text-gray-0 group-focus:text-gray-0 h-4 w-4" />
            </Button>
            <Slider
              className="flex-1"
              value={[zoomLevel]}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.1}
              onValueChange={handleSliderChange}
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={handleZoomIn}
              disabled={zoomLevel >= MAX_ZOOM}
              className="group h-8 w-8 shrink-0 rounded-lg disabled:pointer-events-none disabled:opacity-50"
              aria-label="Увеличить"
            >
              <ZoomIn className="text-gray-80 group-hover:text-gray-0 group-active:text-gray-0 group-focus:text-gray-0 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
