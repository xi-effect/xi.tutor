import { useEffect } from 'react';
import type { Editor } from '@ibodr/draw';
import { isEditableTarget, isEmptyLabelEditOnTypeContext, isEmptyLabelShape } from '../utils';
import { startLabelEditing, insertFirstLabelCharacter } from '../shapes/labels/startLabelEditing';

/**
 * Пустой стикер/фигура показывает декоративный курсор без редактора —
 * при первой печатной клавише включаем editing_shape (как editOnType в draw).
 */
export function useEditOnTypeForLabels(editor: Editor | null) {
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEmptyLabelEditOnTypeContext(editor)) return;
      if (isEditableTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1) return;

      const shapeId = editor.getSelectedShapeIds()[0];
      const shape = editor.getShape(shapeId);
      if (!shape || !editor.canEditShape(shape) || !isEmptyLabelShape(editor, shapeId)) return;

      event.preventDefault();
      event.stopPropagation();
      startLabelEditing(editor, shapeId);
      insertFirstLabelCharacter(editor, shapeId, event.key);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [editor]);
}
