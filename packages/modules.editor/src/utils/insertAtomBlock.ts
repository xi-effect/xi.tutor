import { Editor, JSONContent } from '@tiptap/core';
import { ActiveBlockT } from '../types';
import { getCurrentBlock } from './getCurrentBlock';

export function insertAtomBlock(
  editor: Editor | null,
  content: JSONContent,
  activeBlock?: ActiveBlockT,
): boolean {
  if (!editor || !editor.isEditable) return false;

  const currentBlock = getCurrentBlock(editor, activeBlock);
  if (!currentBlock?.node) return false;

  const insertPos = currentBlock.pos + currentBlock.node.nodeSize;
  editor.chain().focus().insertContentAt(insertPos, content).run();
  return true;
}
