import { useMemo, useRef, useEffect, useCallback } from 'react';
import Konva from 'konva';
import { useUIStore } from '../store';
import { BoardElement } from '../types';

interface VirtualizationOptions {
  viewportPadding?: number;
  enableVirtualization?: boolean;
  batchSize?: number;
  renderThreshold?: number;
}

interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useVirtualization = (
  elements: BoardElement[],
  options: VirtualizationOptions = {},
) => {
  const {
    viewportPadding = 200,
    enableVirtualization = true,
    batchSize = 50,
    renderThreshold = 1000,
  } = options;

  const { scale, stagePosition, viewport } = useUIStore();
  const stageRef = useRef<Konva.Stage | null>(null);
  const lastVisibleElementsRef = useRef<Set<string>>(new Set());

  // Функция для получения границ элемента
  const getElementBounds = useCallback((element: BoardElement): ElementBounds => {
    switch (element.type) {
      case 'line': {
        if (!element.points || element.points.length === 0) {
          return {
            x: element.x,
            y: element.y,
            width: 0,
            height: 0,
          };
        }
        const xPoints = element.points.filter((_, i) => i % 2 === 0);
        const yPoints = element.points.filter((_, i) => i % 2 === 1);
        return {
          x: Math.min(...xPoints),
          y: Math.min(...yPoints),
          width: Math.max(...xPoints) - Math.min(...xPoints),
          height: Math.max(...yPoints) - Math.min(...yPoints),
        };
      }
      case 'text':
        return {
          x: element.x,
          y: element.y,
          width: element.width || 100,
          height: element.height || 20,
        };
      case 'rect':
      case 'rectangle':
        return {
          x: element.x,
          y: element.y,
          width: element.width || 100,
          height: element.height || 100,
        };
      case 'circle':
        if (!element.radius) {
          return {
            x: element.x,
            y: element.y,
            width: 0,
            height: 0,
          };
        }
        return {
          x: element.x - element.radius,
          y: element.y - element.radius,
          width: element.radius * 2,
          height: element.radius * 2,
        };
      case 'image':
        return {
          x: element.x,
          y: element.y,
          width: element.width || 100,
          height: element.height || 100,
        };
      case 'sticker':
        return {
          x: element.x,
          y: element.y,
          width: element.width || 50,
          height: element.height || 50,
        };
      default:
        return {
          x: element.x,
          y: element.y,
          width: 100,
          height: 100,
        };
    }
  }, []);

  // Вычисляем видимую область
  const viewportBounds = useMemo(() => {
    if (!viewport || !enableVirtualization) {
      return null;
    }

    const visibleWidth = viewport.width / scale;
    const visibleHeight = viewport.height / scale;

    return {
      x: -stagePosition.x / scale - viewportPadding,
      y: -stagePosition.y / scale - viewportPadding,
      width: visibleWidth + viewportPadding * 2,
      height: visibleHeight + viewportPadding * 2,
    };
  }, [viewport, scale, stagePosition, viewportPadding, enableVirtualization]);

  // Проверяем пересечение элементов с видимой областью
  const isElementVisible = useCallback(
    (element: BoardElement): boolean => {
      if (!viewportBounds || !enableVirtualization) return true;

      const elementBounds = getElementBounds(element);

      return (
        elementBounds.x < viewportBounds.x + viewportBounds.width &&
        elementBounds.x + elementBounds.width > viewportBounds.x &&
        elementBounds.y < viewportBounds.y + viewportBounds.height &&
        elementBounds.y + elementBounds.height > viewportBounds.y
      );
    },
    [viewportBounds, enableVirtualization, getElementBounds],
  );

  // Фильтруем видимые элементы
  const visibleElements = useMemo(() => {
    if (!enableVirtualization || elements.length < renderThreshold) {
      return elements;
    }

    return elements.filter(isElementVisible);
  }, [elements, enableVirtualization, isElementVisible, renderThreshold]);

  // Оптимизированная функция для пакетного рендеринга
  const batchRender = useCallback(
    (renderCallback: (element: BoardElement) => void) => {
      if (!enableVirtualization || visibleElements.length <= batchSize) {
        visibleElements.forEach(renderCallback);
        return;
      }

      let currentIndex = 0;
      const totalElements = visibleElements.length;

      const renderNextBatch = () => {
        const endIndex = Math.min(currentIndex + batchSize, totalElements);
        const batch = visibleElements.slice(currentIndex, endIndex);

        batch.forEach(renderCallback);
        currentIndex = endIndex;

        if (currentIndex < totalElements) {
          // Рендерим следующий пакет в следующем кадре
          requestAnimationFrame(renderNextBatch);
        }
      };

      renderNextBatch();
    },
    [visibleElements, enableVirtualization, batchSize],
  );

  // Функция для получения stage reference
  const setStageRef = useCallback((stage: Konva.Stage | null) => {
    stageRef.current = stage;
  }, []);

  // Отслеживаем изменения видимых элементов
  useEffect(() => {
    const currentVisibleIds = new Set(visibleElements.map((el) => el.id));
    const previousVisibleIds = lastVisibleElementsRef.current;

    // Находим новые элементы
    const newElements = visibleElements.filter((el) => !previousVisibleIds.has(el.id));

    // Находим элементы, которые больше не видимы
    const hiddenElements = Array.from(previousVisibleIds).filter(
      (id) => !currentVisibleIds.has(id),
    );

    // Обновляем кэш
    lastVisibleElementsRef.current = currentVisibleIds;

    // Логируем для отладки
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      if (newElements.length > 0 || hiddenElements.length > 0) {
        console.log(`Virtualization: ${newElements.length} new, ${hiddenElements.length} hidden`);
      }
    }
  }, [visibleElements]);

  return {
    visibleElements,
    batchRender,
    setStageRef,
    isElementVisible,
    getElementBounds,
    viewportBounds,
    totalElements: elements.length,
    visibleCount: visibleElements.length,
    virtualizationEnabled: enableVirtualization,
  };
};
