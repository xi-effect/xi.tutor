import { Editor, Transforms, Element } from 'slate';
import { ReactEditor } from 'slate-react';
import { NormalizeEditor } from '../types';
import { nanoid } from 'nanoid';

import { normalizeQuoteNode } from './normalizeQuoteNode';

export const withNormalize = <T extends ReactEditor>(editor: T): T & NormalizeEditor => {
  const { normalizeNode } = editor;

  // Функция для проверки, является ли элемент допустимым блоком
  const isValidBlock = (node: Element): boolean => {
    return Element.isElement(node) && node.children.length > 0;
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Check if empty node
    if (Element.isElement(node) && node.children.length === 0) {
      Transforms.removeNodes(editor as unknown as Editor, { at: path });
      return;
    }

    if (Editor.isEditor(node) && node.children.length === 0) {
      const paragraph = { type: 'paragraph', children: [{ text: '' }], id: nanoid(6) } as Element;
      Transforms.insertNodes(editor as unknown as Editor, paragraph, { at: [0] });
      return;
    }

    // Quote normalization
    if (Element.isElement(node) && node.type === 'quote') {
      normalizeQuoteNode(editor as unknown as Editor, node, path);
    }

    // Otherwise, use the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  // Добавляем метод isValidBlock в редактор
  Object.defineProperty(editor, 'isValidBlock', {
    value: isValidBlock,
    writable: true,
    configurable: true,
  });

  return editor as T & NormalizeEditor;
};
