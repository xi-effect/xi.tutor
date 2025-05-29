import { create } from 'zustand';
import * as Y from 'yjs';

type UndoRedoStoreT = {
  undoManager: Y.UndoManager | null;
  setManager: (manager: Y.UndoManager) => void;
  getManager: () => Y.UndoManager | null;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

export const useUndoRedoStore = create<UndoRedoStoreT>((set, get) => ({
  undoManager: null,
  canUndo: false,
  canRedo: false,

  setManager: (mgr) => {
    mgr.on('stack-item-added', () => {
      set({
        canUndo: mgr.undoStack.length > 0,
        canRedo: mgr.redoStack.length > 0,
      });
    });
    mgr.on('stack-item-popped', () => {
      set({
        canUndo: mgr.undoStack.length > 0,
        canRedo: mgr.redoStack.length > 0,
      });
    });
    set({ undoManager: mgr });
  },

  getManager: () => get().undoManager,

  undo: () => {
    const manager = get().undoManager;
    if (manager) {
      manager.undo();
    }
  },

  redo: () => {
    const manager = get().undoManager;
    if (manager) {
      manager.redo();
    }
  },
}));
