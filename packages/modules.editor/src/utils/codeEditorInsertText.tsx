import { KeyboardEvent } from 'react';
import { Editor, Transforms } from 'slate';

/**
 * Utility to handle special text insertions in code editor
 */
export const codeEditorInsertText = (
  editor: Editor,
  event: KeyboardEvent<HTMLDivElement>,
  text: string,
) => {
  // Prevent default browser behavior
  event.preventDefault();

  const { selection } = editor;

  if (selection) {
    const [parentNode] = Editor.parent(editor, selection);

    if (parentNode && 'type' in parentNode && parentNode.type === 'code') {
      Transforms.insertText(editor, text);
    }
  }
};
