import { Editor } from '@tiptap/react';
import { ActiveBlockT, BlockTypeT } from '../types';
import { moveBlock } from '../utils/moveBlock';

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

export const useBlockMenuActions = (editor: Editor | null) => {
  const duplicate = (activeBlock: ActiveBlockT) => {
    if (!editor) return;
    if (!activeBlock.node) return;
    const positionAfterActiveNode = activeBlock.pos + activeBlock.node.nodeSize;
    const copiedNode = activeBlock.node.toJSON();

    editor.chain().focus().insertContentAt(positionAfterActiveNode, copiedNode).run();
  };

  const remove = (activeBlock: ActiveBlockT) => {
    if (!editor || !editor.isEditable) return false;
    try {
      const node = activeBlock.node;

      if (!node) return;

      editor
        .chain()
        .focus()
        .deleteRange({
          from: activeBlock.pos,
          to: activeBlock.pos + node.nodeSize,
        })
        .run();
    } catch (err) {
      console.warn('Ошибка при удалении:', err);
      return false;
    }
  };

  const changeType = (activeBlock: ActiveBlockT, type?: BlockTypeT) => {
    if (!editor || !editor.isEditable || !type) return;

    const config = NODE_TYPES_MAP[type];

    if (!config) return;

    const nodeType = editor.schema.nodes[config.type];

    if (!nodeType) return;

    const currentType = activeBlock.node?.type.name || '';

    if (!TEXT_BLOCKS.includes(currentType)) {
      return;
    }

    editor.commands.command(({ tr, dispatch }) => {
      tr.setNodeMarkup(activeBlock.pos, nodeType, config.attrs);

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

  const moveUp = (activeBlock: ActiveBlockT) => moveBlock(editor, activeBlock, 'up');
  const moveDown = (activeBlock: ActiveBlockT) => moveBlock(editor, activeBlock, 'down');

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
