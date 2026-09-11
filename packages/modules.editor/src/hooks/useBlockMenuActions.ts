import { useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { ActiveBlockT, BlockTypeT } from '../types';
import { moveBlock } from '../utils/moveBlock';
import { getCurrentBlock } from '../utils/getCurrentBlock';

const TEXT_BLOCKS = ['paragraph', 'heading'];

const LIST_ITEM_CONTENT = [
  {
    type: 'listItem',
    content: [{ type: 'paragraph' }],
  },
];

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

  bulletList: {
    type: 'bulletList',
    attrs: {},
    content: LIST_ITEM_CONTENT,
  },

  orderedList: {
    type: 'orderedList',
    attrs: {},
    content: LIST_ITEM_CONTENT,
  },

  taskList: {
    type: 'taskList',
    attrs: {},
    content: [
      {
        type: 'taskItem',
        attrs: { checked: false },
        content: [{ type: 'paragraph' }],
      },
    ],
  },
};

// Модульного уровня (не замыкают состояние хука) — не нуждаются в useCallback,
// ссылка стабильна сама по себе.
const createBlock = (
  editor: Editor | null,
  type: BlockTypeT,
  activeBlock: ActiveBlockT | undefined,
) => {
  if (!editor || !editor.isEditable || !type || !activeBlock) return;

  const currentBlock = getCurrentBlock(editor, activeBlock);

  if (!currentBlock?.node) return;

  const config = NODE_TYPES_MAP[type];
  if (!config) return;

  const insertPos = currentBlock.pos + currentBlock.node.nodeSize;

  const content =
    'content' in config && config.content
      ? { type: config.type, attrs: config.attrs, content: config.content }
      : editor.schema.nodes[config.type]?.createAndFill(config.attrs)?.toJSON();

  if (!content) return;

  editor.chain().focus().insertContentAt(insertPos, content).run();
};

const downloadImage = (src: string) => {
  const link = document.createElement('a');
  link.setAttribute('target', '_blank');
  link.href = src;
  link.download = 'image.png';
  link.click();
};

export const useBlockMenuActions = (
  editor: Editor | null,
  getActiveBlock?: () => ActiveBlockT | undefined,
) => {
  const insertImage = useCallback(
    (src: string, alt?: string) => {
      if (!editor || !editor.isEditable) return;

      const activeBlock = getCurrentBlock(editor, getActiveBlock?.());

      if (!activeBlock?.node) return;

      const insertPos = activeBlock.pos + activeBlock.node.nodeSize;

      editor
        .chain()
        .focus()
        .insertContentAt(insertPos, {
          type: 'image',
          attrs: { src, alt },
        })
        .run();
    },
    [editor, getActiveBlock],
  );

  const changeType = useCallback(
    (type?: BlockTypeT) => {
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
    },
    [editor, getActiveBlock],
  );

  // В момент вызова получаем свежую позицию
  const insertBlock = useCallback(
    (type: BlockTypeT) => {
      if (!getActiveBlock) return;
      const activeBlock = getActiveBlock();
      return createBlock(editor, type, activeBlock);
    },
    [editor, getActiveBlock],
  );

  const insertCode = useCallback(
    (codeText: string = '', language: string = 'plaintext') => {
      if (!editor || !editor.isEditable) return;

      // Вставляем после текущего блока; если позицию не удалось определить — в конец
      const activeBlock = getCurrentBlock(editor, getActiveBlock?.());
      const insertPos = activeBlock?.node
        ? activeBlock.pos + activeBlock.node.nodeSize
        : editor.state.doc.content.size;

      editor
        .chain()
        .focus()
        .insertContentAt(insertPos, {
          type: 'codeBlock',
          attrs: { language: language || 'plaintext' },
          content: codeText ? [{ type: 'text', text: codeText }] : [],
        })
        .run();
    },
    [editor, getActiveBlock],
  );

  // В момент вызова получаем свежую позицию
  const moveUp = useCallback(() => {
    if (!getActiveBlock) return;
    return moveBlock(editor, 'up', getActiveBlock());
  }, [editor, getActiveBlock]);

  const moveDown = useCallback(() => {
    if (!getActiveBlock) return;
    return moveBlock(editor, 'down', getActiveBlock());
  }, [editor, getActiveBlock]);

  const duplicate = useCallback(() => {
    if (!getActiveBlock) return;
    return duplicateBlock(editor, getActiveBlock());
  }, [editor, getActiveBlock]);

  const remove = useCallback(() => {
    if (!getActiveBlock) return;
    return removeBlock(editor, getActiveBlock());
  }, [editor, getActiveBlock]);

  return {
    duplicate,
    remove,
    changeType,
    insertImage,
    downloadImage,
    moveDown,
    moveUp,
    insertCode,
    insertBlock,
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
