import type { Editor } from '@tiptap/core';

/**
 * Фиксирует drag-handle на текущем блоке: не прячется, не прыгает
 * за курсором и не начинает drag. Нужно, пока открыто меню «+»/действий.
 */
export function setDragHandleLocked(editor: Editor, locked: boolean) {
  if (editor.isDestroyed) return;

  editor.view.dispatch(
    editor.state.tr.setMeta('lockDragHandle', locked).setMeta('addToHistory', false),
  );
}
