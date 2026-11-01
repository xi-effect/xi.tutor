import type { Editor, JSONContent } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';

export type PromptBlock = {
  node: Node;
  pos: number;
};

export type PromptBlockKind =
  'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'orderedList';

const REPLACEABLE = new Set(['paragraph', 'heading']);

export const topLevelBlock = (editor: Editor): PromptBlock | null => {
  const $from = editor.state.selection.$from;
  if ($from.depth < 1) return null;
  const node = $from.node(1);
  if (!node.isBlock) return null;
  return { node, pos: $from.before(1) };
};

const contentFor = (kind: PromptBlockKind): JSONContent => {
  const item = { type: 'listItem', content: [{ type: 'paragraph' }] };
  switch (kind) {
    case 'paragraph':
      return { type: 'paragraph' };
    case 'heading1':
      return { type: 'heading', attrs: { level: 1 } };
    case 'heading2':
      return { type: 'heading', attrs: { level: 2 } };
    case 'heading3':
      return { type: 'heading', attrs: { level: 3 } };
    case 'bulletList':
      return { type: 'bulletList', content: [item] };
    case 'orderedList':
      return { type: 'orderedList', content: [item] };
  }
};

export const insertPromptBlock = (
  editor: Editor,
  kind: PromptBlockKind,
  block: PromptBlock | null,
) => {
  const content = contentFor(kind);
  editor
    .chain()
    .focus()
    .command(({ tr, dispatch }) => {
      const node = editor.schema.nodeFromJSON(content);
      if (!node) return false;
      if (!block) {
        tr.insert(tr.doc.content.size, node);
      } else if (REPLACEABLE.has(block.node.type.name) && block.node.content.size === 0) {
        tr.replaceWith(block.pos, block.pos + block.node.nodeSize, node);
      } else {
        tr.insert(block.pos + block.node.nodeSize, node);
      }
      dispatch?.(tr);
      return true;
    })
    .run();
};
