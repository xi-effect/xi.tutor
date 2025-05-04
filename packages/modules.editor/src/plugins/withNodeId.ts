/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { nanoid } from 'nanoid';
import { Transforms, Editor, Node, Element, Text } from 'slate';

export const withNodeId = <T extends Editor>(editor: T): T => {
  const { normalizeNode } = editor;

  // Check if node has ID property
  const hasNodeId = (node: Node): boolean => {
    return !!(Element.isElement(node) && !Text.isText(node) && (node as any).id);
  };

  // Add ID for all children of the Editor
  const addNodeId = () => {
    try {
      for (const [node, path] of Editor.nodes(editor, {
        at: [],
        match: (n) => Element.isElement(n) && path.length === 1 && !hasNodeId(n),
      })) {
        Transforms.setNodes(
          editor,
          { id: nanoid(6) },
          {
            at: path,
          },
        );
      }
    } catch (error) {
      // ...
    }
  };

  editor.normalizeNode = (entry) => {
    try {
      addNodeId();
    } catch (error) {
      // ...
    }

    return normalizeNode(entry);
  };

  return editor;
};
