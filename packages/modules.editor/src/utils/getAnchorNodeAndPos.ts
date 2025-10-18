import { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';

export const getAnchorNodeAndPos = (editor: Editor | null) => {
  if (!editor) return null;
  const { state } = editor;
  const { selection } = state;

  if (selection instanceof NodeSelection) {
    const pos = selection.from;
    const node = selection.node;
    return { pos, node };
  }

  const $anchor = selection.$anchor;
  for (let depth = $anchor.depth; depth > 0; depth--) {
    const node = $anchor.node(depth);
    const start = $anchor.start(depth);
    if (!node) continue;
    if (node.isBlock || node.type.name === 'image') {
      return { pos: start, node };
    }
  }

  return null;
};
