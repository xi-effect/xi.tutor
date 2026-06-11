import { Editor } from '@tiptap/core';
import { ActiveBlockT } from '../types';
import { NodeSelection } from '@tiptap/pm/state';

export const getCurrentBlock = (
  editor: Editor | null,
  activeBlock?: ActiveBlockT | null,
): ActiveBlockT | null => {
  if (!editor) return null;

  const { state } = editor;

  if (activeBlock) return activeBlock;

  // Fallback: берём из текущего selection
  const { selection } = state;

  if (selection instanceof NodeSelection) {
    return {
      editor,
      node: selection.node,
      pos: selection.from,
    };
  }

  const $from = selection.$from;
  for (let depth = $from.depth; depth >= 1; depth--) {
    const node = $from.node(depth);
    if (node.isBlock) {
      const blockPos = $from.start(depth) - 1;
      return { editor, node, pos: blockPos };
    }
  }

  return null;
};
