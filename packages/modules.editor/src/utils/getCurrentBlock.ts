import { Editor } from '@tiptap/core';
import { ActiveBlockT } from '../types';
import { NodeSelection } from '@tiptap/pm/state';

export const getCurrentBlock = (
  editor: Editor | null,
  activeBlock?: ActiveBlockT | null,
): ActiveBlockT | null => {
  if (!editor) return null;
  if (activeBlock) return activeBlock;

  const { selection } = editor.state;

  if (selection instanceof NodeSelection) {
    return {
      editor,
      node: selection.node,
      pos: selection.from,
    };
  }

  const $from = selection.$from;

  for (let depth = $from.depth; depth >= 0; depth--) {
    const node = $from.node(depth);

    if (node.isBlock) {
      return {
        editor,
        node,
        pos: depth > 0 ? $from.before(depth) : 0,
      };
    }
  }

  return null;
};
