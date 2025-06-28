import { memo, useEffect, useMemo } from 'react';
import { Layer, Transformer } from 'react-konva';
import { LineShape } from '../shapes';
import { useStage } from '../../../providers';
import { useBoardStore } from '../../../store';
import { useElementHandlers, useIsStageScaling } from '../../../hooks';
import { EditableText } from '../../../features';
import { usePerformanceTracking } from '../../../hooks';
import { useUIStore } from '../../../store';

export const CanvasLayer = memo(() => {
  const { boardElements, selectedElementId, updateElement } = useBoardStore();
  const { scale, stagePosition, viewport } = useUIStore();
  const { trackComponentRender } = usePerformanceTracking();

  const { layerRef, transformerRef } = useStage();
  const { handleTransformEnd, handleDragStart, onChangeTransformerPosition } = useElementHandlers();
  const { isScaling } = useIsStageScaling();

  // Оптимизированная обработка transformer
  useEffect(() => {
    if (transformerRef.current && selectedElementId) {
      const selectedNode = layerRef.current?.findOne(`#${selectedElementId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
        const box = transformerRef.current.getClientRect();
        updateElement('toolbar', { x: box.x, y: box.y });
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current?.nodes([]);
    }
  }, [layerRef, selectedElementId, transformerRef, updateElement]);

  useEffect(() => {
    if (!isScaling && selectedElementId) {
      onChangeTransformerPosition();
    }
  }, [isScaling, onChangeTransformerPosition, selectedElementId]);

  // Улучшенная виртуализация с учетом масштаба и позиции
  const visibleElements = useMemo(() => {
    if (!viewport) return boardElements;

    // Если элементов меньше 30, рендерим все
    if (boardElements.length < 30) {
      return boardElements;
    }

    // Рассчитываем видимую область с учетом масштаба
    const visibleWidth = viewport.width / scale;
    const visibleHeight = viewport.height / scale;
    const buffer = Math.max(visibleWidth, visibleHeight) * 0.3; // Уменьшаем буфер для производительности

    const startX = -stagePosition.x / scale - buffer;
    const endX = -stagePosition.x / scale + visibleWidth + buffer;
    const startY = -stagePosition.y / scale - buffer;
    const endY = -stagePosition.y / scale + visibleHeight + buffer;

    return boardElements.filter((element) => {
      // Для линий проверяем, есть ли точки в видимой области
      if (element.type === 'line' && element.points) {
        const hasVisiblePoints = element.points.some((point, index) => {
          if (index % 2 === 0) {
            // x координата
            const x = point;
            const y = element.points?.[index + 1] ?? 0;
            return x >= startX && x <= endX && y >= startY && y <= endY;
          }
          return false;
        });
        return hasVisiblePoints;
      }

      // Для других элементов проверяем позицию
      if (element.x !== undefined && element.y !== undefined) {
        return element.x >= startX && element.x <= endX && element.y >= startY && element.y <= endY;
      }

      return true; // Если не можем определить, рендерим
    });
  }, [boardElements, viewport, scale, stagePosition.x, stagePosition.y]);

  // Мемоизированный рендеринг элементов
  const renderedElements = useMemo(() => {
    trackComponentRender('CanvasLayer', () => {
      // Функция рендеринга отслеживается внутри
    });

    return visibleElements.map((element) => {
      if (element.type === 'line') {
        return <LineShape key={element.id} element={element} />;
      }
      if (element.type === 'text') {
        return <EditableText key={element.id} element={element} />;
      }
      return null;
    });
  }, [visibleElements, trackComponentRender]);

  // Оптимизированный transformer
  const optimizedTransformer = useMemo(() => {
    if (!selectedElementId) return null;

    return (
      <Transformer
        ref={transformerRef}
        rotateEnabled={false}
        flipEnabled={false}
        anchorCornerRadius={8}
        anchorStroke="#070707"
        borderStroke="#070707"
        borderDash={[5, 5]}
        padding={8}
        enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        onTransformEnd={handleTransformEnd}
        onDragStart={handleDragStart}
        onTransformStart={handleDragStart}
        perfectDrawEnabled={false}
        listening={true}
      />
    );
  }, [selectedElementId, transformerRef, handleTransformEnd, handleDragStart]);

  return (
    <Layer
      ref={layerRef}
      listening={true}
      clearBeforeDraw={true} // Включаем очистку для предотвращения дублирования
    >
      {renderedElements}
      {optimizedTransformer}
    </Layer>
  );
});

CanvasLayer.displayName = 'CanvasLayer';
