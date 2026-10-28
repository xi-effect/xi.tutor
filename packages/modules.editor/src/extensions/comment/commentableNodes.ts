import type { Node as PMNode } from '@tiptap/pm/model';

/** Блочные ноды, к которым можно оставить комментарий. Новые типы добавлять сюда. */
export const COMMENTABLE_NODE_TYPES = [
  'image',
  'audio',
  'pdf',
  'presentation',
  'file',
  'activity',
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
