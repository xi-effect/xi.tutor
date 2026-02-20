import { Editor } from '@tiptap/react';
import { BlockTypeT } from '../types';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { moveBlock } from '../utils/moveBlock';

export const useBlockMenuActions = (editor: Editor | null) => {
  const duplicate = () => {
    if (!editor || !editor.isEditable) return false;

    try {
      const { state } = editor;
      const { selection } = state;
      const chain = editor.chain().focus();

      if (selection instanceof NodeSelection) {
        const selectedNode = selection.node;
        const insertPos = selection.to;

        chain.insertContentAt(insertPos, selectedNode.toJSON()).run();
        return true;
      }

      const $anchor = selection.$anchor;

      for (let depth = 1; depth <= $anchor.depth; depth++) {
        const node = $anchor.node(depth);

        if (node.type.name === 'doc' || !node.type.spec.group) {
          continue;
        }

        const nodeStart = $anchor.start(depth);
        const insertPos = Math.min(nodeStart + node.nodeSize, state.doc.content.size);

        chain.insertContentAt(insertPos, node.toJSON()).run();
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const deleteNodeAtPosition = (editor: Editor, pos: number, nodeSize: number): boolean => {
    const chain = editor.chain().focus();

    let success = chain.deleteRange({ from: pos, to: pos + nodeSize }).run();
    if (success) return true;

    success = chain.setNodeSelection(pos).deleteSelection().run();
    return success;
  };

  const remove = () => {
    if (!editor || !editor.isEditable) return false;

    try {
      const { state } = editor;
      const { selection } = state;

      if (selection instanceof NodeSelection) {
        const pos = selection.from;
        const node = selection.node;
        if (!node) return false;
        return deleteNodeAtPosition(editor, pos, node.nodeSize);
      }

      const $pos = selection.$anchor;

      for (let depth = $pos.depth; depth >= 0; depth--) {
        const node = $pos.node(depth);
        const pos = $pos.before(depth);

        if (!node) continue;

        if (node.isBlock || node.type.name === 'image') {
          return deleteNodeAtPosition(editor, pos, node.nodeSize);
        }
      }

      if (selection instanceof TextSelection && !selection.empty) {
        return editor.chain().focus().deleteSelection().run();
      }

      return false;
    } catch (err) {
      console.warn('Ошибка при удалении:', err);
      return false;
    }
  };

  const changeType = (type: BlockTypeT) => {
    if (!editor || !editor.isEditable) return;

    const changeTypeMap: Record<string, () => void> = {
      paragraph: () => editor.chain().focus().setParagraph().run(),
      heading1: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      heading2: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      heading3: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    };

    changeTypeMap[type]?.();
  };

  const insertImage = (src: string, alt?: string) => {
    if (!editor || !editor.isEditable) return;

    const { state } = editor;
    const { selection } = state;

    if (selection instanceof NodeSelection) {
      const posAfter = selection.to;
      editor
        .chain()
        .focus()
        .insertContentAt(posAfter, { type: 'image', attrs: { src, alt } })
        .run();
      return;
    }

    editor.chain().focus().insertContent({ type: 'image', attrs: { src, alt } }).run();
  };

  const downloadImage = (src: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = 'image.png';
    link.click();
  };

  const moveUp = () => moveBlock(editor, 'up');
  const moveDown = () => moveBlock(editor, 'down');

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
