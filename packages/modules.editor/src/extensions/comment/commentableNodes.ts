import type { Node as PMNode } from '@tiptap/pm/model';

/**
 * Блочные ноды, к которым можно оставить комментарий.
 *
 * Как может прикрепляться комментарий:
 *  - к тексту, где схема разрешает `comment` (см. CommentMark);
 *  - к этим нодам — атрибуты `commentThreadId` и `commentColor` (см. CommentNodeAnchor).
 *
 * Один тред может иметь несколько якорей сразу: марку на тексте и атрибуты на нескольких нодах.
 * Новую кастомную ноду достаточно добавить сюда.
 */
export const COMMENTABLE_NODE_TYPES = [
  'image',
  'audio',
  'pdf',
  'presentation',
  'file',
  'activity',
  'codeBlock', // схема запрещает марки внутри кода, поэтому комментарий крепится ко всему блоку
] as const;

const COMMENTABLE_SET = new Set<string>(COMMENTABLE_NODE_TYPES);

/**
 * Возвращает ноду, если диапазон в точности равен одной commentable-ноде
 * (то есть выделена только она, например через NodeSelection). Иначе null.
 *
 * Нужна, чтобы отличить «выделили одну ноду» от «выделили текст, возможно с нодами»:
 * в первом случае нельзя ставить текстовый курсор на границе блока.
 */
export function getCommentableNodeAt(
  doc: PMNode,
  range: { from: number; to: number },
): PMNode | null {
  if (range.from < 0 || range.from >= doc.content.size) return null;
  const node = doc.nodeAt(range.from);
  if (!node || node.isText || !COMMENTABLE_SET.has(node.type.name)) return null;
  return range.from + node.nodeSize === range.to ? node : null;
}

/**
 * Позиции всех commentable-нод, которые ПЕРЕСЕКАЮТСЯ с диапазоном (не обязательно целиком).
 * Если выделение захватило хоть часть блока кода, рамка ставится на весь блок.
 *
 * Ноды, которые только касаются границы диапазона, не включаются.
 * Внутрь найденных нод не спускаемся, но обходим обычные контейнеры (списки, таблицы).
 */
export function getAnchorNodesInRange(doc: PMNode, range: { from: number; to: number }): number[] {
  const positions: number[] = [];
  doc.nodesBetween(range.from, range.to, (node, pos) => {
    if (node.isText || !COMMENTABLE_SET.has(node.type.name)) return true;
    positions.push(pos);
    return false;
  });
  return positions;
}
