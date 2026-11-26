import type { Editor } from '@ibodr/draw';

/** После создания фигуры остаёмся в инструменте, только если включена нативная фиксация. */
export function releaseToolUnlessLocked(editor: Editor) {
  if (editor.getInstanceState().isToolLocked) return;
  editor.setCurrentTool('select');
}

/** Escape в простое выходит из инструмента. Незавершённый жест отменяется отдельно и инструмент сохраняет. */
export function exitToolIfIdle(editor: Editor, hasPendingGesture: boolean) {
  if (hasPendingGesture) return;
  editor.setCurrentTool('select');
}
