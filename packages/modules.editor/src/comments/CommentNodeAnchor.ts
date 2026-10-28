import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';
import { COMMENTABLE_NODE_TYPES } from '../extensions/comment/commentableNodes';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentNodeAnchor: {
      setNodeComment: (pos: number, threadId: string, color: string) => ReturnType;
      unsetNodeComment: (threadId: string) => ReturnType;
    };
  }
}

const framesKey = new PluginKey<DecorationSet>('commentNodeFrames');

/** Рамки у всех нод с комментарием. Заходим только в блоки, внутрь textblock не спускаемся. */
function buildFrames(doc: PMNode): DecorationSet {
  const list: Decoration[] = [];
  doc.descendants((node, pos) => {
    const id = node.attrs.commentThreadId as string | null | undefined;
    if (id) {
      list.push(
        Decoration.node(pos, pos + node.nodeSize, {
          'data-comment-node': '',
          'data-comment-thread-id': id,
          style: `--comment-color: ${node.attrs.commentColor ?? 'var(--xi-gray-50)'}`,
        }),
      );
    }
    return !node.isTextblock;
  });
  return DecorationSet.create(doc, list);
}

export const CommentNodeAnchor = Extension.create({
  name: 'commentNodeAnchor',

  addGlobalAttributes() {
    const hidden = {
      default: null,
      rendered: false, // не попадает в clipboard-HTML
      keepOnSplit: false,
      parseHTML: () => null, // при вставке комментарий не клонируется
    };
    return [
      {
        types: [...COMMENTABLE_NODE_TYPES],
        attributes: { commentThreadId: hidden, commentColor: hidden },
      },
    ];
  },

  addCommands() {
    return {
      setNodeComment:
        (pos, threadId, color) =>
        ({ tr, dispatch }) => {
          const node = tr.doc.nodeAt(pos);
          if (!node || !(COMMENTABLE_NODE_TYPES as readonly string[]).includes(node.type.name)) {
            return false;
          }
          if (dispatch) {
            tr.setNodeAttribute(pos, 'commentThreadId', threadId);
            tr.setNodeAttribute(pos, 'commentColor', color);
          }
          return true;
        },

      unsetNodeComment:
        (threadId) =>
        ({ tr, dispatch }) => {
          const positions: number[] = [];
          tr.doc.descendants((node, pos) => {
            if (node.attrs.commentThreadId === threadId) positions.push(pos);
            return !node.isTextblock;
          });
          if (!positions.length) return false;
          if (dispatch) {
            for (const pos of positions) {
              tr.setNodeAttribute(pos, 'commentThreadId', null);
              tr.setNodeAttribute(pos, 'commentColor', null);
            }
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: framesKey,
        state: {
          init: (_, { doc }) => buildFrames(doc),
          apply: (tr, prev) => (tr.docChanged ? buildFrames(tr.doc) : prev),
        },
        props: {
          decorations: (state) => framesKey.getState(state) ?? null,
        },
      }),

      // Защита от дублей: «Дублировать», копипаст или drag-copy ноды не должны
      // создавать вторую ноду с тем же threadId. Остаётся первая в порядке документа.
      new Plugin({
        key: new PluginKey('commentNodeDedupe'),
        appendTransaction(transactions, _old, newState) {
          if (!transactions.some((t) => t.docChanged)) return null;

          const seen = new Set<string>();
          let tr: Transaction | null = null;

          newState.doc.descendants((node, pos) => {
            const id = node.attrs.commentThreadId as string | null | undefined;
            if (id) {
              if (seen.has(id)) {
                tr ??= newState.tr;
                tr.setNodeAttribute(pos, 'commentThreadId', null);
                tr.setNodeAttribute(pos, 'commentColor', null);
              } else {
                seen.add(id);
              }
            }
            return !node.isTextblock;
          });

          // return tr ? tr.setMeta('addToHistory', false) : null;
        },
      }),
    ];
  },
});
