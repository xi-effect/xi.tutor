import { Editor } from '@tiptap/react';
import { BlockTypeT } from '../types';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { getAnchorNodeAndPos } from '../utils/getAnchorNodeAndPos';

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

  const moveNode = (direction: 'up' | 'down'): boolean => {
    if (!editor || !editor.isEditable) return false;

    const nodeInfo = getAnchorNodeAndPos(editor);
    if (!nodeInfo) return false;

    try {
      const { pos, node } = nodeInfo;
      const { state, view } = editor;
      const tr = state.tr;
      const $pos = tr.doc.resolve(pos);
      const parent = $pos.parent;
      const index = $pos.index();

      if (index < 0 || index >= parent.childCount) return false;

      const movedNode = node.type.create(node.attrs, node.content, node.marks);

      if (direction === 'up') {
        if (index === 0) return false;

        let insertPos = $pos.start($pos.depth);
        for (let i = 0; i < index - 1; i++) {
          insertPos += parent.child(i).nodeSize;
        }

        const movedNode = node.type.create(node.attrs, node.content, node.marks);

        tr.deleteRange(pos, pos + node.nodeSize);

        tr.insert(insertPos, movedNode);

        tr.setSelection(NodeSelection.create(tr.doc, insertPos));
        tr.scrollIntoView();
        editor.view.dispatch(tr);
        editor.view.focus();
        return true;
      }

      if (direction === 'down') {
        if (index >= parent.childCount - 1) return false;

        const nextNode = parent.child(index + 1);
        const insertPosEstimate = pos + nextNode.nodeSize;
        tr.deleteRange(pos, pos + node.nodeSize);
        const insertPos = insertPosEstimate;
        const safeInsertPos = Math.min(insertPos, tr.doc.content.size);
        tr.insert(safeInsertPos, movedNode);
        tr.setSelection(NodeSelection.create(tr.doc, safeInsertPos));
        tr.scrollIntoView();
        view.dispatch(tr);
        view.focus();
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error moving node:', err);
      return false;
    }
  };

  const moveUp = () => moveNode('up');
  const moveDown = () => moveNode('down');

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
