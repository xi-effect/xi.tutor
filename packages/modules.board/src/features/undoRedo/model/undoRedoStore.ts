import { create } from 'zustand';
import * as Y from 'yjs';

type UndoRedoStoreT = {
  setManager: (manager: Y.UndoManager) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

let manager: Y.UndoManager | null = null;

export const useUndoRedoStore = create<UndoRedoStoreT>((set) => ({
  canUndo: false,
  canRedo: false,
  setManager: (mgr) => {
    manager = mgr;
    const updateState = () =>
      set({
        canUndo: mgr.undoStack.length > 0,
        canRedo: mgr.redoStack.length > 0,
      });

    mgr.on('stack-item-added', updateState);
    mgr.on('stack-item-popped', updateState);

    updateState();
  },
  undo: () => {
    if (manager) {
      manager.undo();
    }
  },
  redo: () => {
    if (manager) {
      manager.redo();
    }
  },
}));
