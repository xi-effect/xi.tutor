import React, { useEffect, useMemo, useRef } from 'react';
import { Layer, Shape } from 'react-konva';
import Konva from 'konva';
import { useUIStore } from '../../../store';
import { gridConfig } from '../../../utils';
import { useThrottle } from '../../../hooks/useThrottle';

// Константы для оптимизации
const GRID_UPDATE_THROTTLE = 16; // ~60fps

const BackgroundLayerComponent = () => {
  const { viewport, setViewport, stagePosition, scale } = useUIStore();
  const layerRef = useRef<Konva.Layer>(null);
  const shapeRef = useRef<Konva.Shape>(null);

  // Throttled обновление viewport
  const throttledSetViewport = useThrottle((...args: unknown[]) => {
    const viewport = args[0] as { width: number; height: number };
    setViewport(viewport);
  }, GRID_UPDATE_THROTTLE);

  useEffect(() => {
    const updateSize = () => {
      throttledSetViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [throttledSetViewport]);

  // Очищаем слой при изменении масштаба для предотвращения дублирования
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.clear();
      layerRef.current.batchDraw();
    }
  }, [scale]);

  const dots = useMemo(() => {
    if (!viewport) return null;

    const { baseGridStep, baseDotSize, minDotSize } = gridConfig;

    const visibleWidth = viewport.width / scale;
    const visibleHeight = viewport.height / scale;

    // Адаптивный шаг сетки на основе масштаба
    const stepMultiplier = 2 ** Math.round(Math.log2(1 / scale));
    let gridStep = baseGridStep * stepMultiplier;
    let dotSize = Math.max(baseDotSize * stepMultiplier, minDotSize);

    // Дополнительная оптимизация для очень маленьких масштабов
    if (scale < 0.01) {
      gridStep /= 2;
      dotSize /= 2;
    }

    // Увеличиваем буфер для более плавного скролла
    const buffer = Math.max(visibleWidth, visibleHeight) * 0.8;

    const startX = Math.floor((-stagePosition.x / scale - buffer) / gridStep) * gridStep;
    const endX =
      Math.ceil((-stagePosition.x / scale + visibleWidth + buffer) / gridStep) * gridStep;
    const startY = Math.floor((-stagePosition.y / scale - buffer) / gridStep) * gridStep;
    const endY =
      Math.ceil((-stagePosition.y / scale + visibleHeight + buffer) / gridStep) * gridStep;

    return (
      <Shape
        ref={shapeRef}
        sceneFunc={(context) => {
          // Устанавливаем стиль
          context.fillStyle = gridConfig.dotFill;
          context.globalAlpha = Math.min(1, Math.max(0.2, scale * 0.8)); // Более мягкая прозрачность

          // Оптимизированное рисование точек с группировкой
          context.save();

          // Рисуем точки группами для лучшей производительности
          const batchSize = 100;
          let drawnCount = 0;

          for (let x = startX; x <= endX; x += gridStep) {
            for (let y = startY; y <= endY; y += gridStep) {
              context.beginPath();
              context.arc(x, y, dotSize, 0, Math.PI * 2);
              context.fill();

              drawnCount++;
              if (drawnCount % batchSize === 0) {
                context.restore();
                context.save();
                context.fillStyle = gridConfig.dotFill;
                context.globalAlpha = Math.min(1, Math.max(0.2, scale * 0.8));
              }
            }
          }

          context.restore();
        }}
        listening={false}
        perfectDrawEnabled={false}
        hitFunc={() => {
          // Отключаем hit detection для лучшей производительности
        }}
      />
    );
  }, [viewport, scale, stagePosition.x, stagePosition.y]);

  return (
    <Layer
      ref={layerRef}
      listening={false}
      clearBeforeDraw={true} // Включаем очистку для предотвращения дублирования
    >
      {dots}
    </Layer>
  );
};

export const BackgroundLayer = React.memo(BackgroundLayerComponent);
