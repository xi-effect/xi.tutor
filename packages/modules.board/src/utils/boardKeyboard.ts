import type { DrShapeId, Editor } from '@ibodr/draw';
import { renderPlaintextFromRichText } from '@ibodr/draw';
import { isEditableTarget } from './isEditableTarget';

export function isEmptyLabelShape(editor: Editor, shapeId: DrShapeId): boolean {
  const shape = editor.getShape(shapeId);
  if (!shape) return false;

  if (shape.type === 'note') {
    return renderPlaintextFromRichText(editor, shape.props.richText).trim() === '';
  }

  if (shape.type === 'xi-geo') {
    const text = shape.props.text;
    return typeof text !== 'string' || text.trim() === '';
  }

  return false;
}

/** Пустой стикер/geo выделен — следующая буква должна попасть в подпись, а не в hotkey инструмента. */
export function isEmptyLabelEditOnTypeContext(editor: Editor): boolean {
  if (editor.getInstanceState().isReadonly) return false;
  if (editor.getEditingShapeId()) return false;
  if (!editor.isIn('select')) return false;

  const selectedIds = editor.getSelectedShapeIds();
  if (selectedIds.length !== 1) return false;

  return isEmptyLabelShape(editor, selectedIds[0]);
}

/** Не перехватывать board hotkeys, пока пользователь вводит или редактирует текст на shape. */
export function shouldIgnoreBoardHotkeys(editor: Editor, target: EventTarget | null): boolean {
  if (isEditableTarget(target)) return true;
  if (editor.getEditingShapeId()) return true;
  return false;
}
