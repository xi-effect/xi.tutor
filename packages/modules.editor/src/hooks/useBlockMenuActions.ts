import { Editor } from '@tiptap/react';
import { ActiveBlockT, BlockTypeT } from '../types';
import { moveBlock } from '../utils/moveBlock';
import { getCurrentBlock } from '../utils/getCurrentBlock';

const TEXT_BLOCKS = ['paragraph', 'heading'];
const NODE_TYPES_MAP = {
  paragraph: {
    type: 'paragraph',
    attrs: {},
  },

  heading1: {
    type: 'heading',
    attrs: { level: 1 },
  },

  heading2: {
    type: 'heading',
    attrs: { level: 2 },
  },

  heading3: {
    type: 'heading',
    attrs: { level: 3 },
  },
};

export const useBlockMenuActions = (
  editor: Editor | null,
  getActiveBlock?: () => ActiveBlockT | undefined,
) => {
  const insertImage = (src: string, alt?: string) => {
    if (!editor || !editor.isEditable) return;

    const endPos = editor.state.doc.content.size;
    editor
      .chain()
      .focus()
      .insertContentAt(endPos, [
        {
          type: 'image',
          attrs: { src, alt },
        },
      ])
      .run();
  };

  const changeType = (type?: BlockTypeT) => {
    if (!editor || !editor.isEditable || !type || !getActiveBlock) return;

    const activeBlock = getActiveBlock();

    if (!activeBlock || !activeBlock.node) return;

    const config = NODE_TYPES_MAP[type];
    if (!config) return;

    const nodeType = editor.schema.nodes[config.type];
    if (!nodeType) return;

    const currentType = activeBlock.node?.type.name || '';
    if (!TEXT_BLOCKS.includes(currentType)) return;

    editor.commands.command(({ tr, dispatch }) => {
      tr.setNodeMarkup(activeBlock.pos, nodeType, config.attrs);
      dispatch?.(tr);
      return true;
    });
  };

  const downloadImage = (src: string) => {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.href = src;
    link.download = 'image.png';
    link.click();
  };

  const insertCode = (codeText: string, language: string = 'plaintext') => {
    if (!editor || !editor.isEditable) return;

    const endPos = editor.state.doc.content.size;
    editor
      .chain()
      .focus()
      .insertContentAt(endPos, {
        type: 'codeBlock',
        attrs: { language: language || 'plaintext' },
        content: codeText ? [{ type: 'text', text: codeText }] : [],
      })
      .run();
    return;
  };

  // В момент вызова получаем свежую позицию
  const moveUp = () => {
    if (!getActiveBlock) return;
    const activeBlock = getActiveBlock();
    return moveBlock(editor, 'up', activeBlock);
  };

  const moveDown = () => {
    if (!getActiveBlock) return;
    const activeBlock = getActiveBlock();
    return moveBlock(editor, 'down', activeBlock);
  };

  const duplicate = () => {
    if (!getActiveBlock) return;
    const activeBlock = getActiveBlock();
    return duplicateBlock(editor, activeBlock);
  };

  const remove = () => {
    if (!getActiveBlock) return;
    const activeBlock = getActiveBlock();
    return removeBlock(editor, activeBlock);
  };

  return {
    duplicate,
    remove,
    changeType,
    insertImage,
    downloadImage,
    moveDown,
    moveUp,
    insertCode,
  };
};

export function duplicateBlock(editor: Editor | null, activeBlock?: ActiveBlockT): boolean {
  if (!editor) return false;

  const currentBlock = getCurrentBlock(editor, activeBlock);
  if (!currentBlock || !currentBlock.node) return false;

  const positionAfterActiveNode = currentBlock.pos + currentBlock.node.nodeSize;
  const copiedNode = currentBlock.node.toJSON();

  editor.chain().focus().insertContentAt(positionAfterActiveNode, copiedNode).run();
  return true;
}

export function removeBlock(editor: Editor | null, activeBlock?: ActiveBlockT): boolean {
  if (!editor || !editor.isEditable) return false;

  const currentBlock = getCurrentBlock(editor, activeBlock);
  if (!currentBlock || !currentBlock.node) return false;

  try {
    editor
      .chain()
      .focus()
      .deleteRange({
        from: currentBlock.pos,
        to: currentBlock.pos + currentBlock.node.nodeSize,
      })
      .run();
    return true;
  } catch (err) {
    console.warn('Ошибка при удалении:', err);
    return false;
  }
}
