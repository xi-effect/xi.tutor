import type { Editor } from '@ibodr/draw';

/** Пишет в документ без шага Undo. Изменение всё равно уходит в синхронизацию. */
export function runWithoutHistory(editor: Editor, update: () => void) {
  editor.run(update, { history: 'ignore' });
}
