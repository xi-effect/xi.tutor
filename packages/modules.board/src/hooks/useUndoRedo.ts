import { useEditor, useCanUndo, useCanRedo } from 'tldraw';

export function useUndoRedo() {
  const editor = useEditor();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return { undo: editor.undo, redo: editor.redo, canUndo, canRedo };
}
