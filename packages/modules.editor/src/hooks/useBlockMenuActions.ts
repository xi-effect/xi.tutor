import { Editor } from '@tiptap/react';
import { BlockTypeT } from '../types';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';

export const useBlockMenuActions = (editor: Editor | null) => {
  const duplicate = () => {
    if (!editor) return;

    const { state } = editor.view;
    const { selection } = state;
    const { $from } = selection;

    const node = $from.parent;
    const nodeType = node.type;

    const newNode = nodeType.create(node.attrs, node.content);

    editor.chain().focus().insertContentAt($from.after(), newNode).run();
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
    if (!editor) return;

    const changeTypeMap: Record<string, () => void> = {
      paragraph: () => editor.chain().focus().setParagraph().run(),
      heading1: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      heading2: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      heading3: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    };

    changeTypeMap[type]?.();
  };

  const insertImage = (src: string, alt?: string) => {
    if (!editor) return;

    editor.chain().focus().setImage({ src, alt }).run();
  };

  return {
    duplicate,
    remove,
    changeType,
    insertImage,
  };
};
