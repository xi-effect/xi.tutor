import { useCallback, useRef, useEffect, useMemo } from 'react';
import Konva from 'konva';
import { useUIStore } from '../store';

interface KonvaOptimizationOptions {
  enableCaching?: boolean;
  enableBatchDraw?: boolean;
  enableAdaptiveQuality?: boolean;
  batchDrawDelay?: number;
}

export const useKonvaOptimization = (
  stageRef: React.RefObject<Konva.Stage>,
  options: KonvaOptimizationOptions = {},
) => {
  const {
    enableCaching = true,
    enableBatchDraw = true,
    enableAdaptiveQuality = true,
    batchDrawDelay = 16,
  } = options;

  const { scale } = useUIStore();
  const batchDrawTimeoutRef = useRef<number | null>(null);
  const cachedNodesRef = useRef<Set<Konva.Node>>(new Set());

  // Определяем качество рендеринга на основе масштаба
  const renderQuality = useMemo(() => {
    if (!enableAdaptiveQuality) return 'high';

    if (scale < 0.3) return 'low';
    if (scale < 0.7) return 'medium';
    return 'high';
  }, [scale, enableAdaptiveQuality]);

  // Оптимизированная функция для кэширования узлов
  const cacheNode = useCallback(
    (node: Konva.Node) => {
      if (!enableCaching || !node) return;

      try {
        // Проверяем, не кэширован ли уже узел
        if (cachedNodesRef.current.has(node)) return;

        // Кэшируем узел с адаптивным качеством
        const quality = renderQuality === 'low' ? 0.5 : renderQuality === 'medium' ? 0.8 : 1;
        node.cache({
          pixelRatio: quality,
          drawBorder: false,
        });

        cachedNodesRef.current.add(node);
      } catch (error) {
        console.warn('Failed to cache Konva node:', error);
      }
    },
    [enableCaching, renderQuality],
  );

  // Функция для очистки кэша узла
  const clearNodeCache = useCallback((node: Konva.Node) => {
    if (!node) return;

    try {
      node.clearCache();
      cachedNodesRef.current.delete(node);
    } catch (error) {
      console.warn('Failed to clear Konva node cache:', error);
    }
  }, []);

  // Функция для пакетной перерисовки
  const batchDraw = useCallback(
    (callback?: () => void) => {
      if (!enableBatchDraw || !stageRef.current) {
        if (callback) callback();
        return;
      }

      // Очищаем предыдущий таймаут
      if (batchDrawTimeoutRef.current) {
        clearTimeout(batchDrawTimeoutRef.current);
      }

      // Устанавливаем новый таймаут
      batchDrawTimeoutRef.current = setTimeout(() => {
        if (stageRef.current) {
          stageRef.current.batchDraw();
        }
        if (callback) callback();
      }, batchDrawDelay);
    },
    [enableBatchDraw, stageRef, batchDrawDelay],
  );

  // Функция для оптимизации изображений
  const optimizeImage = useCallback(
    (imageNode: Konva.Image) => {
      if (!enableAdaptiveQuality || !imageNode) return;

      const image = imageNode.image() as HTMLImageElement;
      if (!image) return;

      // Применяем фильтры в зависимости от качества
      if (renderQuality === 'low') {
        imageNode.filters([Konva.Filters.Blur]);
        imageNode.blurRadius(0.5);
      } else if (renderQuality === 'medium') {
        imageNode.filters([]);
      } else {
        imageNode.filters([]);
      }

      // Кэшируем изображение
      cacheNode(imageNode);
    },
    [enableAdaptiveQuality, renderQuality, cacheNode],
  );

  // Функция для оптимизации текста
  const optimizeText = useCallback(
    (textNode: Konva.Text) => {
      if (!enableAdaptiveQuality || !textNode) return;

      // При низком качестве уменьшаем детализацию
      if (renderQuality === 'low') {
        const currentFontSize = textNode.fontSize();
        textNode.fontSize(Math.max(8, currentFontSize * 0.8));
      }

      // Кэшируем текст
      cacheNode(textNode);
    },
    [enableAdaptiveQuality, renderQuality, cacheNode],
  );

  // Функция для оптимизации фигур
  const optimizeShape = useCallback(
    (shapeNode: Konva.Shape) => {
      if (!enableCaching || !shapeNode) return;

      // Отключаем perfect draw для лучшей производительности
      shapeNode.perfectDrawEnabled(false);

      // Кэшируем фигуру
      cacheNode(shapeNode);
    },
    [enableCaching, cacheNode],
  );

  // Очистка всех кэшей при изменении масштаба
  useEffect(() => {
    if (cachedNodesRef.current.size > 0) {
      cachedNodesRef.current.forEach((node) => {
        if (node && node.clearCache) {
          node.clearCache();
        }
      });
      cachedNodesRef.current.clear();
    }
  }, [scale]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (batchDrawTimeoutRef.current) {
        clearTimeout(batchDrawTimeoutRef.current);
      }

      // Очищаем все кэши - копируем ref в переменную для избежания проблем с exhaustive-deps
      const cachedNodes = cachedNodesRef.current;
      cachedNodes.forEach((node) => {
        if (node && node.clearCache) {
          node.clearCache();
        }
      });
      cachedNodes.clear();
    };
  }, []);

  return {
    renderQuality,
    cacheNode,
    clearNodeCache,
    batchDraw,
    optimizeImage,
    optimizeText,
    optimizeShape,
    isCached: (node: Konva.Node) => cachedNodesRef.current.has(node),
  };
};
