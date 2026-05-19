import type { Editor } from '@tiptap/core';
import { ActiveBlockT } from '../types';
import { NodeSelection } from '@tiptap/pm/state';

/**
 * Перемещает текущий блок вверх или вниз в документе.
 * Используется для DnD-альтернативы (меню, горячие клавиши).
 */
export function moveBlock(
  editor: Editor | null,
  activeBlock: ActiveBlockT,
  direction: 'up' | 'down',
): boolean {
  if (!editor || !editor.isEditable) return false;

  const { state, view } = editor;
  const { doc } = state;

  const { node, pos } = activeBlock;

  if (!node) return false;

  try {
    const $pos = doc.resolve(pos);

    const parent = $pos.parent;
    const index = $pos.index();

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= parent.childCount) {
      return false;
    }

    const currentNode = parent.child(index);
    const targetNode = parent.child(targetIndex);

    // вычисляем позиции соседних нод
    let currentPos = $pos.start();

    for (let i = 0; i < index; i++) {
      currentPos += parent.child(i).nodeSize;
    }

    let targetPos = $pos.start();

    for (let i = 0; i < targetIndex; i++) {
      targetPos += parent.child(i).nodeSize;
    }

    const tr = state.tr;

    if (direction === 'down') {
      tr.delete(targetPos, targetPos + targetNode.nodeSize);
      tr.delete(currentPos, currentPos + currentNode.nodeSize);

      tr.insert(currentPos, targetNode);
      tr.insert(currentPos + targetNode.nodeSize, currentNode);

      const newPos = currentPos + targetNode.nodeSize;

      tr.setSelection(NodeSelection.create(tr.doc, newPos));
    }

    if (direction === 'up') {
      tr.delete(currentPos, currentPos + currentNode.nodeSize);
      tr.delete(targetPos, targetPos + targetNode.nodeSize);

      tr.insert(targetPos, currentNode);
      tr.insert(targetPos + currentNode.nodeSize, targetNode);

      tr.setSelection(NodeSelection.create(tr.doc, targetPos));
    }

    tr.scrollIntoView();

    view.dispatch(tr);
    view.focus();

    return true;
  } catch (err) {
    console.error('moveBlock error:', err);
    return false;
  }
}
