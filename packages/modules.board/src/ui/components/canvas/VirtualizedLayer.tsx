import React, { useMemo, useRef, useEffect } from 'react';
import { Layer } from 'react-konva';
import Konva from 'konva';
import { useUIStore } from '../../../store';
import { BoardElement } from '../../../types';

interface VirtualizedLayerProps {
  elements: BoardElement[];
  children: (element: BoardElement) => React.ReactNode;
  viewportPadding?: number;
  enableVirtualization?: boolean;
}

export const VirtualizedLayer: React.FC<VirtualizedLayerProps> = ({
  elements,
  children,
  viewportPadding = 100,
  enableVirtualization = true,
}) => {
  const { scale, stagePosition } = useUIStore();
  const layerRef = useRef<Konva.Layer>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  // Получаем ссылку на stage через layer
  useEffect(() => {
    if (layerRef.current) {
      stageRef.current = layerRef.current.getStage();
    }
  }, []);

  // Функция для получения границ элемента
  const getElementBounds = (element: BoardElement) => {
    switch (element.type) {
      case 'line':
        if (!element.points || element.points.length === 0) {
          return {
            x: element.x,
            y: element.y,
            width: 0,
            height: 0,
          };
        }
        return {
          x: Math.min(...element.points.filter((_, i) => i % 2 === 0)),
          y: Math.min(...element.points.filter((_, i) => i % 2 === 1)),
          width:
            Math.max(...element.points.filter((_, i) => i % 2 === 0)) -
            Math.min(...element.points.filter((_, i) => i % 2 === 0)),
          height:
            Math.max(...element.points.filter((_, i) => i % 2 === 1)) -
            Math.min(...element.points.filter((_, i) => i % 2 === 1)),
        };
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
  };

  // Вычисляем видимые элементы
  const visibleElements = useMemo(() => {
    if (!enableVirtualization || !stageRef.current) {
      return elements;
    }

    const stage = stageRef.current;
    const stageWidth = stage.width();
    const stageHeight = stage.height();

    // Вычисляем видимую область с учетом масштаба и позиции
    const viewport = {
      x: -stagePosition.x / scale - viewportPadding,
      y: -stagePosition.y / scale - viewportPadding,
      width: stageWidth / scale + viewportPadding * 2,
      height: stageHeight / scale + viewportPadding * 2,
    };

    return elements.filter((element) => {
      // Получаем границы элемента
      const elementBounds = getElementBounds(element);

      // Проверяем пересечение с видимой областью
      return (
        elementBounds.x < viewport.x + viewport.width &&
        elementBounds.x + elementBounds.width > viewport.x &&
        elementBounds.y < viewport.y + viewport.height &&
        elementBounds.y + elementBounds.height > viewport.y
      );
    });
  }, [elements, scale, stagePosition, viewportPadding, enableVirtualization]);

  // Оптимизируем рендеринг при масштабировании
  const optimizedChildren = useMemo(() => {
    return visibleElements.map((element) => (
      <React.Fragment key={element.id}>{children(element)}</React.Fragment>
    ));
  }, [visibleElements, children]);

  return (
    <Layer ref={layerRef} listening={true}>
      {optimizedChildren}
    </Layer>
  );
};
