import { Editor, Transforms, Element } from 'slate';
import { ReactEditor } from 'slate-react';

import { normalizeQuoteNode } from './normalizeQuoteNode';

export const withNormalize = <T extends ReactEditor>(editor: T) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Check if empty node
    if (Element.isElement(node) && node.children.length === 0) {
      Transforms.removeNodes(editor, { at: path });
      return;
    }

    if (Editor.isEditor(node) && node.children.length === 0) {
      const paragraph = { type: 'paragraph', children: [{ text: '' }] };
      Transforms.insertNodes(editor, paragraph, { at: [0] });
      return;
    }

    // Quote normalization
    if (Element.isElement(node) && node.type === 'quote') {
      normalizeQuoteNode(editor, node, path);
    }

    // Otherwise, use the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};
