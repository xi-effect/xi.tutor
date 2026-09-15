import { Editor } from '@tiptap/core';
import { ActiveBlockT } from '../types';
import { NodeSelection } from '@tiptap/pm/state';

export const getCurrentBlock = (
  editor: Editor | null,
  activeBlock?: ActiveBlockT | null,
): ActiveBlockT | null => {
  if (!editor) return null;

  const { state } = editor;

  if (activeBlock) return activeBlock;

  // Fallback: берём из текущего selection
  const { selection } = state;

  if (selection instanceof NodeSelection) {
    return {
      editor,
      node: selection.node,
      pos: selection.from,
    };
  }

  const $from = selection.$from;
  for (let depth = $from.depth; depth >= 1; depth--) {
    const node = $from.node(depth);
    if (node.isBlock) {
      const blockPos = $from.start(depth) - 1;
      return { editor, node, pos: blockPos };
    }
  }

  return null;
};

/**
 * Блок верхнего уровня (глубина 1) под курсором — не самый вложенный.
 * Нужен там, где нет наведения DragHandle (мобильный тулбар): операции
 * над блоком и вставка должны работать со списком/цитатой целиком,
 * а не с параграфом внутри `<li>`.
 */
export const getTopLevelBlock = (editor: Editor | null): ActiveBlockT | null => {
  if (!editor) return null;

  const { selection } = editor.state;

  if (selection instanceof NodeSelection && selection.node.isBlock) {
    return { editor, node: selection.node, pos: selection.from };
  }

  const $from = selection.$from;
  if ($from.depth < 1) return null;

  const node = $from.node(1);
  if (!node.isBlock) return null;

  return { editor, node, pos: $from.before(1) };
};
