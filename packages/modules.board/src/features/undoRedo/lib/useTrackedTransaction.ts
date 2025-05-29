import { useCallback } from 'react';
import * as Y from 'yjs';
import { useUndoRedoStore } from '../model/undoRedoStore';

export const useTrackedTransaction = () => {
  const undoManager = useUndoRedoStore((state) => state.undoManager);

  const executeTrackedTransaction = useCallback(
    (action: () => void, origin: string = 'user') => {
      if (!undoManager) {
        console.warn('UndoManager not available');
        action();
        return;
      }

      const scopeItem = undoManager.scope?.[0];
      if (!scopeItem) {
        console.warn('UndoManager scope not available');
        action();
        return;
      }

      let yDoc: Y.Doc | null = null;

      if (scopeItem instanceof Y.Doc) {
        yDoc = scopeItem;
      } else if (scopeItem instanceof Y.AbstractType) {
        yDoc = scopeItem.doc;
        if (!yDoc) {
          console.warn('YDoc not available from AbstractType');
          action();
          return;
        }
      } else {
        console.warn('Unknown scope item type');
        action();
        return;
      }

      try {
        yDoc.transact(action, origin);
      } catch (error) {
        console.error('Error in tracked transaction:', error);
        action();
      } finally {
        undoManager.stopCapturing();
      }
    },
    [undoManager],
  );

  return { executeTrackedTransaction };
};
