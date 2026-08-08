import type { Editor } from '@tiptap/core';
import { Fragment } from '@tiptap/pm/model';
import { NodeSelection, TextSelection, Transaction } from '@tiptap/pm/state';
import { Node as PMNode } from '@tiptap/pm/model';

import { getCurrentBlock } from './getCurrentBlock';
import { ActiveBlockT } from '../types';

function getSiblingInfo(parent: PMNode, currentIndex: number, direction: 'up' | 'down') {
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= parent.childCount) {
    return null;
  }

  return {
    targetIndex,
    targetNode: parent.child(targetIndex),
  };
}

function getChildPos(parent: PMNode, parentStart: number, index: number): number {
  let pos = parentStart;

  for (let i = 0; i < index; i++) {
    pos += parent.child(i).nodeSize;
  }

  return pos;
}

function swapAdjacentNodes(
  tr: Transaction,
  firstPos: number,
  firstNode: PMNode,
  secondPos: number,
  secondNode: PMNode,
): Transaction {
  // Валидируем что ноды действительно смежные
  // firstPos + firstNode.nodeSize должно равняться secondPos
  const expectedSecondPos = firstPos + firstNode.nodeSize;
  if (expectedSecondPos !== secondPos) {
    throw new RangeError(
      `Nodes are not adjacent: firstPos=${firstPos}, firstNode.nodeSize=${firstNode.nodeSize}, secondPos=${secondPos}`,
    );
  }

  const from = firstPos;
  const to = secondPos + secondNode.nodeSize;

  // Дополнительная проверка диапазона
  if (from < 0 || to > tr.doc.content.size) {
    throw new RangeError(
      `Range [${from}, ${to}] out of document bounds (size=${tr.doc.content.size})`,
    );
  }

  return tr.replaceWith(from, to, Fragment.fromArray([secondNode, firstNode]));
}

export function moveBlock(
  editor: Editor | null,
  direction: 'up' | 'down',
  block?: ActiveBlockT,
): boolean {
  if (!editor || !editor.isEditable) return false;

  const activeBlock = getCurrentBlock(editor, block);

  if (!activeBlock?.node) return false;

  try {
    const { state, view } = editor;
    const { doc } = state;

    const currentPos = activeBlock.pos;
    const currentNode = activeBlock.node;

    // Проверяем что позиция валидна
    if (currentPos < 0 || currentPos >= doc.content.size) {
      console.warn('moveBlock: invalid currentPos', currentPos);
      return false;
    }

    const $pos = doc.resolve(currentPos);
    const parent = $pos.parent;
    const parentStart = $pos.start();
    const currentIndex = $pos.index();

    const sibling = getSiblingInfo(parent, currentIndex, direction);
    if (!sibling) return false;

    const currentNodePos = getChildPos(parent, parentStart, currentIndex);
    const siblingPos = getChildPos(parent, parentStart, sibling.targetIndex);

    // Убеждаемся что currentNodePos совпадает с activeBlock.pos
    // (расхождение означает что индекс неверный)
    if (currentNodePos !== currentPos) {
      console.warn(
        'moveBlock: position mismatch, recalculated',
        currentNodePos,
        'vs stored',
        currentPos,
      );
    }

    const firstPos = Math.min(currentNodePos, siblingPos);
    const secondPos = Math.max(currentNodePos, siblingPos);

    const isCurrentFirst = currentNodePos < siblingPos;
    const firstNode = isCurrentFirst ? currentNode : sibling.targetNode;
    const secondNode = isCurrentFirst ? sibling.targetNode : currentNode;

    const tr = swapAdjacentNodes(state.tr, firstPos, firstNode, secondPos, secondNode);

    const mappedCurrentPos = tr.mapping.map(currentNodePos);

    // Устанавливаем selection
    if (currentNode.type.name === 'image') {
      const newCurrentPos =
        direction === 'up'
          ? currentNodePos - sibling.targetNode.nodeSize
          : currentNodePos + sibling.targetNode.nodeSize;
      tr.setSelection(NodeSelection.create(tr.doc, newCurrentPos));
    } else if (currentNode.isTextblock) {
      const newCurrentPos =
        direction === 'up'
          ? currentNodePos - sibling.targetNode.nodeSize
          : currentNodePos + sibling.targetNode.nodeSize;
      const $mappedPos = tr.doc.resolve(newCurrentPos);
      tr.setSelection(TextSelection.near($mappedPos));
    } else {
      // Контейнеры (blockquote, list) — ищем первый текстовый потомок

      const $mappedPos = tr.doc.resolve(mappedCurrentPos + 1);
      tr.setSelection(TextSelection.near($mappedPos));
    }

    tr.scrollIntoView();
    view.dispatch(tr);

    requestAnimationFrame(() => {
      view.focus();
    });

    return true;
  } catch (err) {
    console.error('moveBlock error:', err);
    return false;
  }
}
