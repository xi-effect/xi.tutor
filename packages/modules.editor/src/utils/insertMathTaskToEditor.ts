import type { Editor, JSONContent } from '@tiptap/core';
import { statementToReadableText } from 'pages.bank/latex';
import type { ActiveBlockT } from '../types';
import { insertContentRelativeToBlock } from './insertContentRelativeToBlock';

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
  if (!editor) return false;

  return insertContentRelativeToBlock(editor, statementToContent(statement), activeBlock);
}
