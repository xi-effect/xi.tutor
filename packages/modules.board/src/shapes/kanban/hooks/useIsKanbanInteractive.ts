import { DrShapeId, useEditor, useValue } from '@ibodr/draw';

export function useIsKanbanInteractive(shapeId: DrShapeId): boolean {
  const editor = useEditor();

  return useValue(
    'kanban interactive',
    () => {
      if (editor.getIsReadonly()) return false;
      if (!editor.isIn('select.idle')) return false;

      const selectedIds = editor.getSelectedShapeIds();
      return selectedIds.length === 1 && selectedIds[0] === shapeId;
    },
    [editor, shapeId],
  );
}
