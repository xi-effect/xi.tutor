import { Editor } from '@tiptap/core';

export function countNodes(editor: Editor, type: string): number {
  let count = 0;
  editor.state.doc.descendants((node) => {
    if (node.type.name === type) count += 1;
  });
  return count;
}
