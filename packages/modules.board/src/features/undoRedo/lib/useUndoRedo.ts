/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import * as Y from 'yjs';
import { useUndoRedoStore } from '../model/undoRedoStore';

export const useUndoRedo = (yTarget: Y.AbstractType<any>) => {
  useEffect(() => {
    const undoManager = new Y.UndoManager(yTarget, {
      trackedOrigins: new Set(['user', 'move', 'transform']),
      captureTimeout: 100,
    });

    useUndoRedoStore.getState().setManager(undoManager);

    undoManager.on('stack-item-added', () => {
      console.log('[undoManager] stack item added', undoManager.lastChange);
    });

    return () => {
      undoManager.destroy();
    };
  }, [yTarget]);
};
