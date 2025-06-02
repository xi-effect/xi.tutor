import { useEffect } from 'react';
import { useUndoRedoStore } from '../model/undoRedoStore';

export const useUndoRedoShortcuts = () => {
  const { undoManager } = useUndoRedoStore();

  useEffect(() => {
    if (!undoManager) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;

      if (ctrl && key === 'z' && !shift) {
        event.preventDefault();
        if (undoManager.canUndo()) undoManager.undo();
      }

      if ((ctrl && key === 'y') || (ctrl && key === 'z' && shift)) {
        event.preventDefault();
        if (undoManager.canRedo()) undoManager.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoManager]);
};
