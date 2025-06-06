import Konva from 'konva';
import { useCallback } from 'react';
import { calculateZoom, defaultZoomConfig } from '../utils';
import { useUIStore } from '../store';
import { roundScale, zoomLevels } from '../utils/zoomConfig';
import { useElementHandlers } from './useElementHandlers';

/**
 * Хук для обработки масштабирования (зума) при помощи колесика мыши/тачпада.
 */
export const useZoom = (stageRef: React.RefObject<Konva.Stage | null>) => {
  const { setScale, setStagePosition } = useUIStore();
  const { onChangeTransformerPosition } = useElementHandlers();

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const { baseScaleStep, minScale, maxScale } = defaultZoomConfig;

      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const delta = e.evt.deltaY;

      const adjustedFactor = Math.max(0.1, oldScale * 2);

      const scaleStep = baseScaleStep * adjustedFactor;

      let newScale = delta > 0 ? oldScale - scaleStep : oldScale + scaleStep;

      newScale = Math.max(minScale, Math.min(newScale, maxScale));

      newScale = roundScale(newScale);
      setScale(newScale);

      // Обновляем масштаб и позицию Stage, чтобы точка под курсором оставалась на месте
      stage.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      stage.position(newPos);
      stage.batchDraw();
    },
    [stageRef, setScale],
  );

  const handleZoom = useCallback(
    (direction: 'in' | 'out') => {
      const stage = stageRef.current;
      if (!stage) return;

      const { animationDuration, minScale, maxScale } = defaultZoomConfig;

      const oldScale = stage.scaleX();

      const uniqueZoomLevels = [...new Set([...zoomLevels, oldScale])].sort((a, b) => a - b);
      const currentIndex = uniqueZoomLevels.indexOf(oldScale);

      let newScale = oldScale;

      if (direction === 'in') {
        if (currentIndex < uniqueZoomLevels.length - 1) {
          newScale = uniqueZoomLevels[currentIndex + 1];
        }
      } else if (currentIndex > 0) {
        newScale = uniqueZoomLevels[currentIndex - 1];
      }

      if (newScale === oldScale) return;

      // Ограничиваем масштаб в рамках minScale и maxScale
      newScale = Math.max(minScale, Math.min(newScale, maxScale));

      const result = calculateZoom(stageRef, newScale, null, defaultZoomConfig);
      if (!result) return;

      const { newScale: finalScale, newPos } = result;

      stage.to({
        scaleX: finalScale,
        scaleY: finalScale,
        x: newPos.x,
        y: newPos.y,
        duration: animationDuration / 1000,
        easing: Konva.Easings.Linear,
        onUpdate: () => {
          setScale(finalScale);
        },
        onFinish: () => {
          setTimeout(() => {
            onChangeTransformerPosition();
          }, 50);
        },
      });

      setStagePosition({ x: newPos.x, y: newPos.y });
      stage.batchDraw();
    },
    [stageRef, setStagePosition, setScale, onChangeTransformerPosition],
  );

  const handleZoomIn = useCallback(() => handleZoom('in'), [handleZoom]);
  const handleZoomOut = useCallback(() => handleZoom('out'), [handleZoom]);

  const handleResetZoom = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const { animationDuration } = defaultZoomConfig;

    setScale(1);
    setStagePosition({ x: stage.x(), y: stage.y() });

    stage.to({
      scaleX: 1,
      scaleY: 1,
      x: stage.x(),
      y: stage.y(),
      duration: animationDuration / 1000,
      easing: Konva.Easings.Linear,
      onFinish: () => {
        setTimeout(() => {
          onChangeTransformerPosition();
        }, 50);
      },
    });

    stage.batchDraw();
  }, [stageRef, setScale, setStagePosition, onChangeTransformerPosition]);

  return { handleWheel, handleZoomIn, handleZoomOut, handleResetZoom };
};
