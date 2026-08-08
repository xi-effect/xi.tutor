import { DrShapeId, useEditor, useValue } from '@ibodr/draw';

/**
 * Управление audio (play, seek, таймкоды) перехватывает pointer events и ломает
 * рамочное выделение, если shape частично попадает в brush.
 * Как embed/video в @ibodr/draw — controls активны только когда shape единственный
 * в выделении и select tool в idle.
 */
export function useIsAudioControlsInteractive(shapeId: DrShapeId): boolean {
  const editor = useEditor();

  return useValue(
    'audio controls interactive',
    () => {
      if (editor.getIsReadonly()) return false;
      if (!editor.isIn('select.idle')) return false;

      const selectedIds = editor.getSelectedShapeIds();
      return selectedIds.length === 1 && selectedIds[0] === shapeId;
    },
    [editor, shapeId],
  );
}
