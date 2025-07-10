import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { useKeyPress } from 'common.utils';
import { SelectedElementToolbar, Navbar } from '../toolbar';
import { useTldrawStore } from '../../../store';
// import { useCursor } from '../../../hooks';
// import { useWhiteboardCollaborative } from '../../../hooks/useWhiteboardCollaborative';
// import { useUndoRedoShortcuts } from '../../../features';
import { useState } from 'react';
import { TldrawZoomPanel } from './TldrawZoomPanel';

export const TldrawCanvas = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const { selectedElementId, selectElement } = useTldrawStore();

  // const { cursor, mouseHandlers } = useCursor('select'); // Используем select как дефолтный курсор

  // useWhiteboardCollaborative({ roomId: 'test/slate-yjs-demo' });

  useKeyPress('Backspace', () => {
    if (selectedElementId) {
      selectElement(null);
    }
  });

  // Горячие клавиши
  useKeyPress('F12', () => {
    setShowPerformanceMonitor(!showPerformanceMonitor);
  });

  // useUndoRedoShortcuts();

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <Tldraw hideUi>
            <Navbar />
            <SelectedElementToolbar />
            <TldrawZoomPanel />
          </Tldraw>
        </div>
      </div>
    </div>
  );
};
