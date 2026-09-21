import { Editor, JSONContent } from '@tiptap/core';
import { ActiveBlockT } from '../types';
import { insertContentRelativeToBlock } from './insertContentRelativeToBlock';

export function insertAtomBlock(
  editor: Editor | null,
  content: JSONContent,
  activeBlock?: ActiveBlockT,
): boolean {
  if (!editor) return false;

  return insertContentRelativeToBlock(editor, content, activeBlock);
}
