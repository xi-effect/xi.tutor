import { Stage } from 'react-konva';
import { useKeyPress } from 'common.utils';
import { BackgroundLayer } from './BackgroundLayer';
import { CanvasLayer } from './CanvasLayer';
import { SelectedElementToolbar, Navbar, ZoomMenu } from '../toolbar';
import { PerformanceMonitor } from '../performance';
import { useBoardStore } from '../../../store';
import { useStage } from '../../../providers';
import { useCanvasHandlers, useCursor, useZoom } from '../../../hooks';
import { useWhiteboardCollaborative } from '../../../hooks/useWhiteboardCollaborative';
import { useUndoRedoShortcuts } from '../../../features';
import { usePerformanceTracking } from '../../../hooks';
import { useState, useCallback } from 'react';
import Konva from 'konva';

export const Canvas = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const { stageRef } = useStage();
  const { selectedTool, removeElement, selectElement, selectedElementId } = useBoardStore();
  const { handleOnWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleDragEnd } =
    useCanvasHandlers();

  const { trackMouseEvent } = usePerformanceTracking();

  useWhiteboardCollaborative({ roomId: 'test/slate-yjs-demo' });

  const { handleResetZoom, handleZoomIn, handleZoomOut } = useZoom(stageRef);

  const { cursor, mouseHandlers } = useCursor(selectedTool);

  const boardWidth = window.innerWidth;
  const boardHeight = window.innerHeight;

  // Оптимизированные обработчики событий
  const optimizedWheelHandler = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      trackMouseEvent();
      handleOnWheel(e);
    },
    [trackMouseEvent, handleOnWheel],
  );

  const optimizedDragEndHandler = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      trackMouseEvent();
      handleDragEnd(e);
    },
    [trackMouseEvent, handleDragEnd],
  );

  const optimizedMouseDownHandler = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      trackMouseEvent();
      handleMouseDown(e);
    },
    [trackMouseEvent, handleMouseDown],
  );

  const optimizedMouseMoveHandler = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      trackMouseEvent();
      handleMouseMove(e);
    },
    [trackMouseEvent, handleMouseMove],
  );

  const optimizedMouseUpHandler = useCallback(() => {
    trackMouseEvent();
    handleMouseUp();
  }, [trackMouseEvent, handleMouseUp]);

  useKeyPress('Backspace', () => {
    if (selectedElementId) {
      removeElement(selectedElementId);
      selectElement(null);
    }
  });

  // Горячая клавиша для включения/выключения монитора производительности
  useKeyPress('F12', () => {
    setShowPerformanceMonitor(!showPerformanceMonitor);
  });

  useUndoRedoShortcuts();

  return (
    <div className="flex h-full w-full flex-col" style={{ cursor }} {...mouseHandlers}>
      <div className="relative flex-1 overflow-hidden">
        <ZoomMenu zoomIn={handleZoomIn} zoomOut={handleZoomOut} resetZoom={handleResetZoom} />
        <Navbar />
        <SelectedElementToolbar />
        <Stage
          width={boardWidth - 72}
          height={boardHeight - 64}
          ref={stageRef}
          className="bg-gray-0"
          onWheel={optimizedWheelHandler}
          onDragEnd={optimizedDragEndHandler}
          draggable={selectedTool === 'hand'}
          onMouseDown={optimizedMouseDownHandler}
          onMouseMove={optimizedMouseMoveHandler}
          onMouseUp={optimizedMouseUpHandler}
          listening={true}
        >
          <BackgroundLayer />
          <CanvasLayer />
        </Stage>

        <PerformanceMonitor
          isVisible={showPerformanceMonitor}
          onToggle={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
        />
      </div>
    </div>
  );
};
