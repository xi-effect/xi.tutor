/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import * as Y from 'yjs';
import { useUndoRedoStore } from '../model/undoRedoStore';

export const useUndoRedo = (yTarget: Y.AbstractType<any>) => {
  useEffect(() => {
    const undoManager = new Y.UndoManager(yTarget, {
      trackedOrigins: new Set(['local']),
    });
    useUndoRedoStore.getState().setManager(undoManager);
    return () => {
      undoManager.destroy();
    };
  }, [yTarget]);
};
