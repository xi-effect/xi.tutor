import type { Editor, JSONContent } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';
import type { ActiveBlockT } from '../types';
import { getCurrentBlock } from './getCurrentBlock';

const REPLACEABLE_EMPTY_TYPES = new Set(['paragraph', 'heading']);

export function isEmptyReplaceableBlock(node: Node): boolean {
  return REPLACEABLE_EMPTY_TYPES.has(node.type.name) && node.content.size === 0;
}

/**
 * Вставляет контент после текущего блока. Если блок — пустой абзац
 * или заголовок, заменяет его: плюс на пустой строке не оставляет дыру.
 */
export function insertContentRelativeToBlock(
  editor: Editor,
  content: JSONContent | JSONContent[],
  activeBlock?: ActiveBlockT | null,
): boolean {
  if (!editor.isEditable) return false;

  const currentBlock = getCurrentBlock(editor, activeBlock);

  if (!currentBlock?.node) {
    editor.chain().focus().insertContentAt(editor.state.doc.content.size, content).run();
    return true;
  }

  if (isEmptyReplaceableBlock(currentBlock.node)) {
    editor
      .chain()
      .focus()
      .insertContentAt(
        { from: currentBlock.pos, to: currentBlock.pos + currentBlock.node.nodeSize },
        content,
      )
      .run();
    return true;
  }

  editor
    .chain()
    .focus()
    .insertContentAt(currentBlock.pos + currentBlock.node.nodeSize, content)
    .run();
  return true;
}
