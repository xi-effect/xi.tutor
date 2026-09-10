import type { Editor, JSONContent } from '@tiptap/core';
import { statementToReadableText } from 'pages.math-bank/latex';
import type { ActiveBlockT } from '../types';
import { getCurrentBlock } from './getCurrentBlock';

const statementToContent = (statement: string): JSONContent[] => {
  const lines = statementToReadableText(statement).replace(/\r\n/g, '\n').split('\n');
  return lines.map((line) => ({
    type: 'paragraph',
    content: line.length > 0 ? [{ type: 'text', text: line }] : [],
  }));
};

export function insertMathTaskToEditor(
  editor: Editor | null,
  statement: string,
  activeBlock?: ActiveBlockT,
): boolean {
  if (!editor || !editor.isEditable) return false;

  const currentBlock = getCurrentBlock(editor, activeBlock);
  const insertPos = currentBlock?.node
    ? currentBlock.pos + currentBlock.node.nodeSize
    : editor.state.doc.content.size;

  editor.chain().focus().insertContentAt(insertPos, statementToContent(statement)).run();
  return true;
}
