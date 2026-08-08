import type { DrShapeId, Editor } from '@ibodr/draw';
import { startEditingShapeWithRichText } from '@ibodr/draw';

/** Включить редактирование подписи shape (rich text или plain text). */
export function startLabelEditing(editor: Editor, shapeId: DrShapeId): void {
  if (editor.getEditingShapeId() === shapeId) return;

  const shape = editor.getShape(shapeId);
  if (!shape || !editor.canEditShape(shape)) return;

  if (shape.type === 'note' || shape.type === 'text') {
    startEditingShapeWithRichText(editor, shapeId);
    return;
  }

  editor.markHistoryStoppingPoint('editing shape');
  editor.setEditingShape(shapeId);
  editor.setCurrentTool('select.editing_shape', { target: 'shape', shape });
}

/** Вставить первый символ после асинхронного монтирования TipTap/plain input. */
export function insertFirstLabelCharacter(editor: Editor, shapeId: DrShapeId, char: string): void {
  const shape = editor.getShape(shapeId);
  if (!shape) return;

  if (shape.type === 'note' || shape.type === 'text') {
    let attempts = 0;
    const tryInsert = () => {
      const textEditor = editor.getRichTextEditor();
      if (textEditor) {
        textEditor.commands.focus();
        textEditor.commands.insertContent(char);
        return;
      }
      if (attempts++ < 12) {
        window.setTimeout(tryInsert, 50);
      }
    };
    tryInsert();
    return;
  }

  if (shape.type === 'xi-geo') {
    editor.updateShape({
      id: shapeId,
      type: 'xi-geo',
      props: { text: char },
    });
  }
}
