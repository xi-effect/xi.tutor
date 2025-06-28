import { useEffect, useRef, useCallback } from 'react';
import { usePerformanceProfiler } from '../utils/performance';
import { useBoardStore } from '../store';
import { useUIStore } from '../store';

export const usePerformanceTracking = () => {
  const { measureRender, measureAsync, updateMetrics } = usePerformanceProfiler();
  const { boardElements, selectedElementId, selectedTool } = useBoardStore();
  const { scale } = useUIStore();

  const eventCountRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());

  // Отслеживаем количество элементов
  useEffect(() => {
    updateMetrics({ elementCount: boardElements.length }, { action: 'element_count_update' });
  }, [boardElements.length, updateMetrics]);

  // Отслеживаем изменения масштаба
  useEffect(() => {
    updateMetrics({ renderTime: 0 }, { action: 'scale_change', scale });
  }, [scale, updateMetrics]);

  // Отслеживаем изменения выбранного инструмента
  useEffect(() => {
    updateMetrics({ renderTime: 0 }, { action: 'tool_change', elementType: selectedTool });
  }, [selectedTool, updateMetrics]);

  // Отслеживаем изменения выделения
  useEffect(() => {
    updateMetrics({ renderTime: 0 }, { action: 'selection_change' });
  }, [selectedElementId, updateMetrics]);

  // Функция для отслеживания событий мыши
  const trackMouseEvent = useCallback(() => {
    eventCountRef.current++;

    // Обновляем счетчик событий каждые 100 событий
    if (eventCountRef.current % 100 === 0) {
      updateMetrics({ eventCount: eventCountRef.current }, { action: 'event_count_update' });
    }
  }, [updateMetrics]);

  // Функция для отслеживания операций рисования
  const trackDrawingOperation = useCallback(
    (operation: string, fn: () => void) => {
      measureRender(`drawing_${operation}`, fn, {
        elementType: selectedTool,
        scale,
        isCollaborative: true,
      });
    },
    [measureRender, selectedTool, scale],
  );

  // Функция для отслеживания операций трансформации
  const trackTransformOperation = useCallback(
    (operation: string, fn: () => void) => {
      measureRender(`transform_${operation}`, fn, {
        elementType: 'transform',
        scale,
      });
    },
    [measureRender, scale],
  );

  // Функция для отслеживания операций синхронизации
  const trackSyncOperation = useCallback(
    async <T>(operation: string, fn: () => Promise<T>) => {
      return measureAsync(`sync_${operation}`, fn, {
        elementType: 'sync',
        isCollaborative: true,
      });
    },
    [measureAsync],
  );

  // Функция для отслеживания рендеринга компонентов
  const trackComponentRender = useCallback(
    (componentName: string, fn: () => void) => {
      measureRender(`render_${componentName}`, fn, {
        elementType: componentName,
        scale,
      });
    },
    [measureRender, scale],
  );

  // Автоматическое обновление метрик каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      if (timeSinceLastUpdate > 5000) {
        updateMetrics(
          {
            renderTime: 0,
            eventCount: eventCountRef.current,
          },
          { action: 'periodic_update' },
        );
        lastUpdateRef.current = now;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [updateMetrics]);

  return {
    trackMouseEvent,
    trackDrawingOperation,
    trackTransformOperation,
    trackSyncOperation,
    trackComponentRender,
    eventCount: eventCountRef.current,
  };
};
