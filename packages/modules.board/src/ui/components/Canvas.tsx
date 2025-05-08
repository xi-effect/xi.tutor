import { Stage } from 'react-konva';
// import { useKeyPress } from 'pkg.utils.client';
import { BackgroundLayer, SelectedElementToolbar, Navbar, ZoomMenu } from '.';
import { CanvasLayer } from './CanvasLayer';
import { useBoardStore } from '../../store';
import { useStage } from '../../providers';
import { useCanvasHandlers, useCursor, useZoom } from '../../hooks';
import { useWhiteboardCollaborative } from '../../hooks/useWhiteboardCollaborative';

export const Canvas = () => {
  const { stageRef } = useStage();
  const { selectedTool } = useBoardStore();
  const { handleOnWheel, handleMouseUp, handleMouseDown, handleMouseMove, handleDragEnd } =
    useCanvasHandlers();

  useWhiteboardCollaborative({ roomId: 'test/slate-yjs-demo' });

  const { handleResetZoom, handleZoomIn, handleZoomOut } = useZoom(stageRef);

  const { cursor, mouseHandlers } = useCursor(selectedTool);

  const boardWidth = window.innerWidth;
  const boardHeight = window.innerHeight;

  // useKeyPress('Backspace', () => {
  //   if (selectedElementId) {
  //     removeElement(selectedElementId);
  //     selectElement(null);
  //   }
  // });

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
          onWheel={handleOnWheel}
          onDragEnd={handleDragEnd}
          draggable={selectedTool === 'hand'}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <BackgroundLayer />
          <CanvasLayer />
        </Stage>
      </div>
    </div>
  );
};
