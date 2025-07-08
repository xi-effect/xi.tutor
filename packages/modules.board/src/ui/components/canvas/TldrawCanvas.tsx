import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { useKeyPress } from 'common.utils';
import { SelectedElementToolbar, Navbar } from '../toolbar';
import { useTldrawStore } from '../../../store';
import { useCursor } from '../../../hooks';
import { useWhiteboardCollaborative } from '../../../hooks/useWhiteboardCollaborative';
import { useUndoRedoShortcuts } from '../../../features';
import { useState } from 'react';
import { TldrawZoomPanel } from './TldrawZoomPanel';

export const TldrawCanvas = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const { selectedTool, selectElement, selectedElementId } = useTldrawStore();

  const { cursor, mouseHandlers } = useCursor(selectedTool);

  useWhiteboardCollaborative({ roomId: 'test/slate-yjs-demo' });

  useKeyPress('Backspace', () => {
    if (selectedElementId) {
      selectElement(null);
    }
  });

  // Горячие клавиши
  useKeyPress('F12', () => {
    setShowPerformanceMonitor(!showPerformanceMonitor);
  });

  useUndoRedoShortcuts();

  return (
    <div className="flex h-full w-full flex-col" style={{ cursor }} {...mouseHandlers}>
      <div className="relative flex-1 overflow-hidden">
        <Navbar />
        <SelectedElementToolbar />

        <div className="absolute inset-0">
          <Tldraw>
            <TldrawZoomPanel />
          </Tldraw>
        </div>
      </div>
    </div>
  );
};
