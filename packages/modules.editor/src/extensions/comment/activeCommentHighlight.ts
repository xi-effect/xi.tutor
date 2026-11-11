import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';
import { useCommentsUiStore } from '../../comments';

type ActiveState = { threadId: string | null; decorations: DecorationSet };

export const activeCommentKey = new PluginKey<ActiveState>('activeComment');

const EMPTY_STATE: ActiveState = { threadId: null, decorations: DecorationSet.empty };

function buildDecorations(doc: PMNode, threadId: string): DecorationSet {
  const list: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText) return true;
    const has = node.marks.some((m) => m.type.name === 'comment' && m.attrs.threadId === threadId);
    if (has) {
      list.push(Decoration.inline(pos, pos + node.nodeSize, { class: 'comment-active' }));
    }
    return true;
  });
  return DecorationSet.create(doc, list);
}

type UiState = ReturnType<typeof useCommentsUiStore.getState>;

/** Какой тред сейчас должен быть подсвечен. */
const selectActiveId = (s: UiState): string | null =>
  s.commentsVisible ? (s.openThreadId ?? s.draftRange?.threadId ?? null) : null;

export const ActiveCommentHighlight = Extension.create({
  name: 'activeCommentHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin<ActiveState>({
        key: activeCommentKey,

        state: {
          init: () => EMPTY_STATE,
          apply(tr, prev) {
            const meta = tr.getMeta(activeCommentKey) as string | null | undefined;
            const threadId = meta !== undefined ? meta : prev.threadId;

            if (!threadId) return prev.threadId === null ? prev : EMPTY_STATE;
            // тот же тред и документ не менялся — ничего не пересчитываем
            if (threadId === prev.threadId && !tr.docChanged) return prev;

            return { threadId, decorations: buildDecorations(tr.doc, threadId) };
          },
        },

        props: {
          decorations(state) {
            return activeCommentKey.getState(state)?.decorations ?? null;
          },
        },

        // Подписка на стор для реагирования на открытие/закрытие комментария
        view(editorView) {
          const sync = (id: string | null) => {
            if (editorView.isDestroyed) return;
            if (activeCommentKey.getState(editorView.state)?.threadId === id) return;
            editorView.dispatch(
              editorView.state.tr.setMeta(activeCommentKey, id).setMeta('addToHistory', false),
            );
          };

          const initTimer = setTimeout(
            () => sync(selectActiveId(useCommentsUiStore.getState())),
            0,
          );

          const unsubscribe = useCommentsUiStore.subscribe((state, prevState) => {
            const next = selectActiveId(state);
            if (next !== selectActiveId(prevState)) sync(next);
          });

          return {
            destroy() {
              clearTimeout(initTimer);
              unsubscribe();
            },
          };
        },
      }),
    ];
  },
});
