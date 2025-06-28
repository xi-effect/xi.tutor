import { useRef, useCallback, useMemo, useEffect } from 'react';
import Konva from 'konva';
import { useUIStore } from '../store';

interface OptimizedRenderingOptions {
  debounceMs?: number;
  enableAdaptiveQuality?: boolean;
  enableLazyLoading?: boolean;
  batchSize?: number;
}

export const useOptimizedRendering = (
  stageRef: React.RefObject<Konva.Stage>,
  options: OptimizedRenderingOptions = {},
) => {
  const {
    debounceMs = 100,
    enableAdaptiveQuality = true,
    enableLazyLoading = true,
    batchSize = 50,
  } = options;

  const { scale } = useUIStore();
  const debounceTimeoutRef = useRef<number | null>(null);
  const isRenderingRef = useRef(false);
  const renderQueueRef = useRef<(() => void)[]>([]);

  // Определяем качество рендеринга на основе масштаба
  const renderQuality = useMemo(() => {
    if (!enableAdaptiveQuality) return 'high';

    if (scale < 0.5) return 'low';
    if (scale < 1.0) return 'medium';
    return 'high';
  }, [scale, enableAdaptiveQuality]);

  // Оптимизированная функция рендеринга
  const optimizedRender = useCallback(
    (callback?: () => void) => {
      if (!stageRef.current) return;

      const stage = stageRef.current;

      // Добавляем в очередь рендеринга
      if (callback) {
        renderQueueRef.current.push(callback);
      }

      // Очищаем предыдущий таймаут
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Устанавливаем новый таймаут для debounced рендеринга
      debounceTimeoutRef.current = setTimeout(() => {
        if (isRenderingRef.current) return;

        isRenderingRef.current = true;

        // Просто перерисовываем stage
        stage.batchDraw();

        // Выполняем очередь рендеринга
        while (renderQueueRef.current.length > 0) {
          const callback = renderQueueRef.current.shift();
          if (callback) {
            callback();
          }
        }

        isRenderingRef.current = false;
      }, debounceMs);
    },
    [stageRef, debounceMs],
  );

  // Функция для пакетного рендеринга элементов
  const batchRenderElements = useCallback(
    <T>(elements: T[], renderElement: (element: T) => void) => {
      if (!enableLazyLoading) {
        elements.forEach(renderElement);
        return;
      }

      let currentIndex = 0;

      const renderBatch = () => {
        const batch = elements.slice(currentIndex, currentIndex + batchSize);

        batch.forEach(renderElement);
        currentIndex += batchSize;

        if (currentIndex < elements.length) {
          // Рендерим следующий пакет в следующем кадре
          requestAnimationFrame(renderBatch);
        }
      };

      renderBatch();
    },
    [enableLazyLoading, batchSize],
  );

  // Функция для оптимизации изображений при масштабировании
  const optimizeImageRendering = useCallback(
    (imageNode: Konva.Image) => {
      if (!enableAdaptiveQuality) return;

      const image = imageNode.image() as HTMLImageElement;
      if (!image) return;

      // При низком масштабе используем более низкое качество
      if (scale < 0.5) {
        imageNode.cache();
        imageNode.filters([Konva.Filters.Blur]);
        imageNode.blurRadius(0.5);
      } else if (scale < 1.0) {
        imageNode.cache();
        imageNode.filters([]);
      } else {
        imageNode.cache();
        imageNode.filters([]);
      }
    },
    [scale, enableAdaptiveQuality],
  );

  // Функция для оптимизации текста при масштабировании
  const optimizeTextRendering = useCallback(
    (textNode: Konva.Text) => {
      if (!enableAdaptiveQuality) return;

      // При низком масштабе уменьшаем детализацию текста
      if (scale < 0.5) {
        textNode.fontSize(Math.max(8, textNode.fontSize() * scale));
      } else if (scale < 1.0) {
        textNode.fontSize(Math.max(10, textNode.fontSize() * scale));
      }
    },
    [scale, enableAdaptiveQuality],
  );

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    renderQuality,
    optimizedRender,
    batchRenderElements,
    optimizeImageRendering,
    optimizeTextRendering,
    isRendering: isRenderingRef.current,
  };
};
