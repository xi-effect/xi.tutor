import { useRef, useCallback, useMemo } from 'react';
import Konva from 'konva';
import { useUIStore } from '../store';

interface OptimizedZoomOptions {
  throttleMs?: number;
  enableAdaptiveQuality?: boolean;
  lowQualityThreshold?: number;
  mediumQualityThreshold?: number;
}

export const useOptimizedZoom = (
  stageRef: React.RefObject<Konva.Stage>,
  options: OptimizedZoomOptions = {},
) => {
  const {
    throttleMs = 16, // 60fps
    enableAdaptiveQuality = true,
    lowQualityThreshold = 0.5,
    mediumQualityThreshold = 1.0,
  } = options;

  const { scale, setScale } = useUIStore();
  const lastUpdateRef = useRef(0);
  const isUpdatingRef = useRef(false);

  // Определяем качество рендеринга на основе масштаба
  const renderQuality = useMemo(() => {
    if (!enableAdaptiveQuality) return 'high';

    if (scale < lowQualityThreshold) return 'low';
    if (scale < mediumQualityThreshold) return 'medium';
    return 'high';
  }, [scale, enableAdaptiveQuality, lowQualityThreshold, mediumQualityThreshold]);

  // Throttled функция для обновления масштаба
  const throttledSetScale = useCallback(
    (newScale: number) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < throttleMs) {
        return;
      }
      lastUpdateRef.current = now;
      setScale(newScale);
    },
    [setScale, throttleMs],
  );

  // Оптимизированная функция масштабирования
  const handleOptimizedZoom = useCallback(
    (delta: number, point?: { x: number; y: number }) => {
      if (!stageRef.current) return;

      const stage = stageRef.current;
      const oldScale = scale;

      // Вычисляем новый масштаб
      const scaleBy = 1.02;
      const newScale = delta > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      // Ограничиваем масштаб
      const minScale = 0.1;
      const maxScale = 10;
      const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));

      // Если масштаб не изменился, не обновляем
      if (Math.abs(clampedScale - oldScale) < 0.001) return;

      // Применяем масштаб с throttling
      throttledSetScale(clampedScale);

      // Если указана точка, центрируем на ней
      if (point) {
        const mousePointTo = {
          x: (point.x - stage.x()) / oldScale,
          y: (point.y - stage.y()) / oldScale,
        };

        const newPos = {
          x: point.x - mousePointTo.x * clampedScale,
          y: point.y - mousePointTo.y * clampedScale,
        };

        stage.position(newPos);
      }

      // Просто перерисовываем stage
      stage.batchDraw();
    },
    [scale, stageRef, throttledSetScale],
  );

  // Функция для сброса масштаба
  const resetZoom = useCallback(() => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

    setScale(1);
    stage.scale({ x: 1, y: 1 });
    stage.position({
      x: center.x - stage.width() / 2,
      y: center.y - stage.height() / 2,
    });
    stage.batchDraw();
  }, [setScale, stageRef]);

  // Функция для масштабирования к элементу
  const zoomToElement = useCallback(
    (elementBounds: { x: number; y: number; width: number; height: number }) => {
      if (!stageRef.current) return;

      const stage = stageRef.current;
      const stageWidth = stage.width();
      const stageHeight = stage.height();

      // Вычисляем масштаб для вписывания элемента
      const scaleX = stageWidth / elementBounds.width;
      const scaleY = stageHeight / elementBounds.height;
      const newScale = Math.min(scaleX, scaleY) * 0.8; // 80% от максимального размера

      // Центрируем на элементе
      const centerX = elementBounds.x + elementBounds.width / 2;
      const centerY = elementBounds.y + elementBounds.height / 2;

      setScale(newScale);
      stage.scale({ x: newScale, y: newScale });
      stage.position({
        x: stageWidth / 2 - centerX * newScale,
        y: stageHeight / 2 - centerY * newScale,
      });
      stage.batchDraw();
    },
    [setScale, stageRef],
  );

  return {
    scale,
    renderQuality,
    handleOptimizedZoom,
    resetZoom,
    zoomToElement,
    isUpdating: isUpdatingRef.current,
  };
};
