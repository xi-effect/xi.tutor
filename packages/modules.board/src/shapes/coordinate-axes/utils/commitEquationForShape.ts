import type { Editor, DrShapeId } from '@ibodr/draw';
import { evaluateEquation } from './evaluateEquation';

export function commitEquationForShape(
  editor: Editor,
  shapeId: DrShapeId,
  equationDraft: string,
): { ok: true } | { ok: false; error: string } {
  const shape = editor.getShape(shapeId);
  if (!shape || !editor.isShapeOfType(shape, 'coordinate-axes')) {
    return { ok: false, error: 'Фигура не найдена' };
  }

  const trimmed = equationDraft.trim();

  if (!trimmed) {
    editor.updateShape({
      id: shapeId,
      type: 'coordinate-axes',
      props: { equation: '' },
    });
    return { ok: true };
  }

  const result = evaluateEquation(trimmed);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  editor.updateShape({
    id: shapeId,
    type: 'coordinate-axes',
    props: { equation: trimmed },
  });

  return { ok: true };
}
