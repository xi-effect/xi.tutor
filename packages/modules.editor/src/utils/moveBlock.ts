import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { getAnchorNodeAndPos } from './getAnchorNodeAndPos';

/**
 * Перемещает текущий блок вверх или вниз в документе.
 * Используется для DnD-альтернативы (меню, горячие клавиши).
 */
export function moveBlock(editor: Editor | null, direction: 'up' | 'down'): boolean {
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

      tr.deleteRange(pos, pos + node.nodeSize);
      tr.insert(insertPos, movedNode);
      tr.setSelection(NodeSelection.create(tr.doc, insertPos));
      tr.scrollIntoView();
      view.dispatch(tr);
      view.focus();
      return true;
    }

    if (direction === 'down') {
      if (index >= parent.childCount - 1) return false;

      const nextNode = parent.child(index + 1);
      const insertPos = pos + nextNode.nodeSize;
      const safeInsertPos = Math.min(insertPos, tr.doc.content.size);
      tr.deleteRange(pos, pos + node.nodeSize);
      tr.insert(safeInsertPos, movedNode);
      tr.setSelection(NodeSelection.create(tr.doc, safeInsertPos));
      tr.scrollIntoView();
      view.dispatch(tr);
      view.focus();
      return true;
    }

    return false;
  } catch (err) {
    console.error('moveBlock:', err);
    return false;
  }
}
