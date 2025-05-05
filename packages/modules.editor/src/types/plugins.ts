import { Element, Node, Path } from 'slate';
import { CustomEditor } from './slate';

export interface NodeEntry<T extends Node> {
  node: T;
  path: Path;
}

/**
 * Типы для плагина withNodeId
 */
export interface WithNodeIdPlugin {
  // Проверяет, имеет ли узел идентификатор
  hasNodeId: (node: Node) => boolean;

  // Добавляет идентификаторы всем дочерним элементам редактора
  addNodeId: () => void;

  // Нормализация узла (оригинальная функция)
  normalizeNode: (entry: NodeEntry<Node>) => void;
}

/**
 * Типы для плагина withNormalize
 */
export interface WithNormalizePlugin {
  // Нормализация узла (оригинальная функция)
  normalizeNode: (entry: NodeEntry<Node>) => void;

  // Проверка, является ли элемент допустимым блоком
  isValidBlock: (node: Element) => boolean;
}

// Расширение типов для плагинов
export type NodeIdEditor = CustomEditor & WithNodeIdPlugin;
export type NormalizeEditor = CustomEditor & WithNormalizePlugin;
