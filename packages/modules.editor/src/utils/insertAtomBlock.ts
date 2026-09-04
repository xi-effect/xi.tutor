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
  const insertPos = currentBlock?.node
    ? currentBlock.pos + currentBlock.node.nodeSize
    : editor.state.doc.content.size;

  editor.chain().focus().insertContentAt(insertPos, content).run();
  return true;
}
