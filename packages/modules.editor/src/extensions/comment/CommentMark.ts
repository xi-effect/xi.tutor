import { Mark, mergeAttributes } from '@tiptap/core';
import { useCommentsUiStore } from '../../comments';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      setComment: (threadId: string, color: string) => ReturnType;
      unsetComment: (threadId: string) => ReturnType;
    };
  }
}

export const CommentMark = Mark.create({
  name: 'comment',
  excludes: '',
  inclusive: false,

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-comment-thread-id'),
        renderHTML: (attrs) => ({ 'data-comment-thread-id': attrs.threadId }),
      },
      color: {
        default: 'brand-80',
        parseHTML: (el) => el.getAttribute('data-comment-color'),
        renderHTML: (attrs) => ({
          'data-comment-color': attrs.color,
          style: `--comment-color: ${attrs.color}`,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-thread-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const currentOpenId = useCommentsUiStore.getState().openThreadId;
    const isCurrentActive =
      currentOpenId && HTMLAttributes['data-comment-thread-id'] === currentOpenId;
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: `editor-comment-mark ${isCurrentActive ? 'active' : ''}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setComment:
        (threadId, color) =>
        ({ commands }) =>
          commands.setMark(this.name, { threadId, color }),
      unsetComment:
        (threadId) =>
        ({ tr, state, dispatch }) => {
          let found = false;
          state.doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (mark.type.name === this.name && mark.attrs.threadId === threadId) {
                found = true;
                if (dispatch) tr.removeMark(pos, pos + node.nodeSize, mark);
              }
            });
          });
          return found;
        },
    };
  },
});
