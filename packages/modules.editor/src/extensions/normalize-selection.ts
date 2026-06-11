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
    return [
      new Plugin({
        filterTransaction(tr) {
          if (tr.getMeta('normalizeSelectionSkip')) return true;

          // ВАЖНО: не трогаем транзакции с NodeSelection — они валидны
          if (!(tr.selection instanceof TextSelection)) return true;

          // Не трогаем транзакции без steps (они не меняют документ)
          if (tr.steps.length === 0) return true;

          const from = tr.selection.from;
          const to = tr.selection.to;
          const size = tr.doc.content.size;

          if (from <= 0 || to <= 0 || from > size || to > size) {
            return false;
          }

          try {
            const $from = tr.doc.resolve(from);
            const $to = tr.doc.resolve(to);
            if ($from.parent.inlineContent && $to.parent.inlineContent) return true;
            return false;
          } catch {
            return false;
          }
        },

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
      }),
    ];
  },
});
