import type { Node as PMNode } from '@tiptap/pm/model';

/** Блочные ноды, к которым можно оставить комментарий. Новые типы добавлять сюда. */
export const COMMENTABLE_NODE_TYPES = [
  'image',
  'audio',
  'pdf',
  'presentation',
  'file',
  'activity',
  'codeBlock',
] as const;

const COMMENTABLE_SET = new Set<string>(COMMENTABLE_NODE_TYPES);

/** Если range целиком покрывает одну commentable-ноду — возвращает её, иначе null (это текстовый диапазон). */
export function getCommentableNodeAt(
  doc: PMNode,
  range: { from: number; to: number },
): PMNode | null {
  if (range.from < 0 || range.from >= doc.content.size) return null;
  const node = doc.nodeAt(range.from);
  if (!node || node.isText || !COMMENTABLE_SET.has(node.type.name)) return null;
  return range.from + node.nodeSize === range.to ? node : null;
}

/** Все commentable-ноды, которые пересекает диапазон (внутрь атомов и блоков кода не спускаемся). */
export function getAnchorNodesInRange(doc: PMNode, range: { from: number; to: number }): number[] {
  const positions: number[] = [];
  doc.nodesBetween(range.from, range.to, (node, pos) => {
    if (node.isText || !COMMENTABLE_SET.has(node.type.name)) return true;
    positions.push(pos);
    return false;
  });
  return positions;
}
