import type { Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

/**
 * Ставит выделение в валидную позицию с inline content.
 * Вызывать после drop: плагин drag-handle иногда оставляет TextSelection
 * с $from/$to в doc или в узле без inline content → предупреждение и поломка DnD.
 */
export function normalizeSelectionAfterDrop(editor: Editor | null): void {
  if (!editor || editor.isDestroyed) return;

  const { state, view } = editor;
  const { doc, selection } = state;
  const size = doc.content.size;

  if (size < 2) return;

  try {
    // Берём позицию из текущего выделения и находим ближайшую валидную для TextSelection
    const from = Math.max(0, Math.min(selection.from, size));
    const $from = doc.resolve(from);
    const newSelection = TextSelection.near($from);

    if (!selection.eq(newSelection)) {
      view.dispatch(state.tr.setSelection(newSelection));
    }
  } catch {
    // Если resolve/near упали (например, from указывает в doc), ставим курсор в начало первого блока
    const safePos = Math.min(1, size - 1);
    const $pos = doc.resolve(safePos);
    view.dispatch(state.tr.setSelection(TextSelection.near($pos)));
  }
}
