import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { isTrackReference } from '@livekit/components-core';
import { VideoTrack } from '../shared';
import { ZoomIn, ZoomOut } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Slider } from '@xipkg/slider';
import { cn } from '@xipkg/utils';

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
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

  // При открытии панели зума сразу пересчитываем размеры видео, чтобы не было рамок из-за отсутствия transform
  useEffect(() => {
    if (isPanelOpen) {
      updateVideoDimensions();
      updateContainerSize();
    }
  }, [isPanelOpen, updateVideoDimensions, updateContainerSize]);

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

  // Порядок важен: в CSS transform применяется справа налево — сначала scale, потом translate
  const zoomTransform =
    videoDimensions && isZoomed && containerSize
      ? `translate(${-panX * zoomLevel}px, ${-panY * zoomLevel}px) scale(${zoomLevel})`
      : undefined;

  // Зум-режим: при открытии меню (zoom > 1) не используем flex-центрирование, чтобы не было серых рамок
  const isZoomedState = zoomLevel > MIN_ZOOM;
  const canApplyTransform = !!(videoDimensions && zoomTransform);
  const zoomableStyle: React.CSSProperties =
    isZoomedState && canApplyTransform
      ? {
          position: 'absolute',
          left: 0,
          top: 0,
          width: videoDimensions!.width,
          height: videoDimensions!.height,
          transformOrigin: '0 0',
          transform: zoomTransform,
        }
      : {
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          ...(zoomLevel <= MIN_ZOOM
            ? {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }
            : {}),
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

  // Синяя рамка в процентах от размеров видео, чтобы совпадала с основным видом при любом масштабе миниатюры
  const viewportRect =
    containerSize && videoDimensions && thumbScale && thumbWidth > 0 && thumbHeight > 0
      ? (() => {
          const viewW = containerSize.width / zoomLevel;
          const viewH = containerSize.height / zoomLevel;
          const leftPct = (panX / videoDimensions.width) * 100;
          const topPct = (panY / videoDimensions.height) * 100;
          const widthPct = (viewW / videoDimensions.width) * 100;
          const heightPct = (viewH / videoDimensions.height) * 100;
          const left = Math.max(0, Math.min(100 - widthPct, leftPct));
          const top = Math.max(0, Math.min(100 - heightPct, topPct));
          const width = Math.max(2, Math.min(100 - left, widthPct));
          const height = Math.max(2, Math.min(100 - top, heightPct));
          return { left, top, width, height };
        })()
      : null;

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden rounded-2xl', className)}
    >
      <div className="absolute top-0 left-0 h-full w-full" style={zoomableStyle}>
        {zoomLevel <= MIN_ZOOM ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="relative aspect-video max-h-full w-full min-w-0">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Кнопка лупы — только когда панель закрыта */}
      {showZoomButton && (
        <Button
          type="button"
          size="icon"
          variant="none"
          onClick={handleZoomIn}
          className="bg-gray-0/80 hover:bg-gray-0 absolute right-2 bottom-2 z-20 h-8 w-8 rounded-lg backdrop-blur"
          aria-label="Приблизить"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      )}

      {/* Панель зума: fixed в правом нижнем углу экрана, чтобы не «уезжала» при положении плитки слева */}
      {showPanel && (
        <div className="bg-gray-0/80 fixed right-1 bottom-1 z-20 w-[260px] rounded-xl p-1 shadow-lg backdrop-blur">
          {/* Миниатюра с областью просмотра */}
          <div className="bg-gray-20 relative mb-2 overflow-hidden rounded-lg">
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
                      left: `${viewportRect.left}%`,
                      top: `${viewportRect.top}%`,
                      width: `${viewportRect.width}%`,
                      height: `${viewportRect.height}%`,
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
