import { Extension } from '@tiptap/core';
import type { EditorState } from '@tiptap/pm/state';
import { Plugin, TextSelection } from '@tiptap/pm/state';

/**
 * Не даёт невалидной TextSelection попасть в state и чинит уже попавшую
 * (например после DnD или синка с Yjs). Предупреждение при начале перетаскивания
 * = невалидная selection уже в state, её читает BubbleMenu при ре-рендере.
 */
function isTextSelectionInvalid(state: EditorState): boolean {
  const { doc, selection } = state;
  if (!(selection instanceof TextSelection)) return false;
  const from = selection.from;
  const to = selection.to;
  const size = doc.content.size;
  if (from < 0 || to < 0 || from > size || to > size || from === 0 || to === 0) return true;
  try {
    const $from = doc.resolve(from);
    const $to = doc.resolve(to);
    return !$from.parent.inlineContent || !$to.parent.inlineContent;
  } catch {
    return true;
  }
}

export const NormalizeSelection = Extension.create({
  name: 'normalizeSelection',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        appendTransaction(_transactions, _oldState, state) {
          if (!isTextSelectionInvalid(state)) return null;
          const size = state.doc.content.size;
          if (size < 2) return null;
          const safePos = Math.min(1, size - 1);
          const $pos = state.doc.resolve(safePos);
          return state.tr
            .setSelection(TextSelection.near($pos))
            .setMeta('normalizeSelectionSkip', true);
        },
        filterTransaction(tr, state) {
          if (tr.getMeta('normalizeSelectionSkip')) return true;
          // Только транзакции, меняющие документ (drop, paste и т.д.) — не движение курсора
          if (tr.steps.length === 0 || !(tr.selection instanceof TextSelection)) return true;

          // Не трогаем tr.selection.$from/$to — их геттеры могут триггерить предупреждение PM.
          const from = tr.selection.from;
          const to = tr.selection.to;
          const size = tr.doc.content.size;
          if (from < 0 || to < 0 || from > size || to > size) {
            // за границами — чиним
          } else if (from === 0 || to === 0) {
            // позиция 0 = doc, для TextSelection невалидно
          } else {
            try {
              const $from = tr.doc.resolve(from);
              const $to = tr.doc.resolve(to);
              if ($from.parent.inlineContent && $to.parent.inlineContent) return true;
            } catch {
              // resolve упал — чиним
            }
          }

          // Синхронно применяем исправленную транзакцию, чтобы невалидный state ни разу не попал в React
          const fixedTr = state.tr;
          for (const step of tr.steps) {
            fixedTr.step(step);
          }
          const docSize = fixedTr.doc.content.size;
          if (docSize >= 2) {
            const safePos = Math.min(1, docSize - 1);
            const $pos = fixedTr.doc.resolve(safePos);
            fixedTr.setSelection(TextSelection.near($pos)).setMeta('normalizeSelectionSkip', true);
            editor.view.dispatch(fixedTr);
          }
          return false;
        },
        view: () => ({
          update(view) {
            const state = view.state;
            if (!isTextSelectionInvalid(state)) return;
            const size = state.doc.content.size;
            if (size < 2) return;
            const safePos = Math.min(1, size - 1);
            const $pos = state.doc.resolve(safePos);
            const tr = state.tr
              .setSelection(TextSelection.near($pos))
              .setMeta('normalizeSelectionSkip', true);
            view.dispatch(tr);
          },
        }),
      }),
    ];
  },
});
