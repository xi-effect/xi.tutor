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

export const useBlockMenuActions = (editor: Editor | null, activeBlock?: ActiveBlockT) => {
  const duplicate = () => {
    if (!editor) return;
    const currentBlock = getCurrentBlock(editor, activeBlock);
    if (!currentBlock || !currentBlock.node) return;
    const positionAfterActiveNode = currentBlock.pos + currentBlock.node.nodeSize;
    const copiedNode = currentBlock.node.toJSON();

    editor.chain().focus().insertContentAt(positionAfterActiveNode, copiedNode).run();
  };

  const remove = () => {
    if (!editor || !editor.isEditable) return false;

    const currentBlock = getCurrentBlock(editor, activeBlock);

    if (!currentBlock || !currentBlock.node) return;

    try {
      const node = currentBlock.node;

      if (!node) return;

      editor
        .chain()
        .focus()
        .deleteRange({
          from: currentBlock.pos,
          to: currentBlock.pos + node.nodeSize,
        })
        .run();
    } catch (err) {
      console.warn('Ошибка при удалении:', err);
      return false;
    }
  };

  const changeType = (type?: BlockTypeT) => {
    if (!editor || !editor.isEditable || !type) return;
    const currentBlock = getCurrentBlock(editor, activeBlock);

    if (!currentBlock || !currentBlock.node) return;

    const config = NODE_TYPES_MAP[type];

    if (!config) return;

    const nodeType = editor.schema.nodes[config.type];

    if (!nodeType) return;

    const currentType = currentBlock.node?.type.name || '';

    if (!TEXT_BLOCKS.includes(currentType)) {
      return;
    }

    editor.commands.command(({ tr, dispatch }) => {
      tr.setNodeMarkup(currentBlock.pos, nodeType, config.attrs);

      dispatch?.(tr);

      return true;
    });
  };

  const insertImage = (src: string, alt?: string) => {
    if (!editor || !editor.isEditable) return;

    const endPos = editor.state.doc.content.size;

    editor
      .chain()
      .focus()
      .insertContentAt(endPos, [
        {
          type: 'image',
          attrs: {
            src,
            alt,
          },
        },
      ])
      .run();
  };

  const downloadImage = (src: string) => {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.href = src;
    link.download = 'image.png';
    link.click();
  };

  const moveUp = () => moveBlock(editor, 'up', activeBlock);
  const moveDown = () => moveBlock(editor, 'down', activeBlock);

  return {
    duplicate,
    remove,
    changeType,
    insertImage,
    downloadImage,
    moveDown,
    moveUp,
  };
};
