import React from 'react';
import { Element, Node } from 'slate';
/**
 * Свойства компонента содержимого оверлея перетаскивания
 */
interface DragOverlayContentProps {
  element: Element;
}

/**
 * Компонент для отображения оверлея при перетаскивании элементов в редакторе
 * Показывает визуальное представление перетаскиваемого элемента
 */
const DragOverlayContent: React.FC<DragOverlayContentProps> = ({ element }) => {
  // Для отображения текста элемента
  const getTextFromNode = (node: Node): string => {
    if (Element.isElement(node)) {
      let text = '';
      for (const child of node.children) {
        text += getTextFromNode(child);
      }
      return text;
    }

    return node.text || '';
  };

  const text = getTextFromNode(element).trim();

  // Для получения типа элемента с удобочитаемым названием
  const getElementTypeName = (type: string): string => {
    const typeMapping: Record<string, string> = {
      paragraph: 'Абзац',
      'bulleted-list': 'Маркированный список',
      'numbered-list': 'Нумерованный список',
      'list-item': 'Элемент списка',
      code: 'Код',
      quote: 'Цитата',
      tip: 'Подсказка',
      divider: 'Разделитель',
      imageBlock: 'Изображение',
      videoBlock: 'Видео',
      fileBlock: 'Файл',
    };

    return typeMapping[type] || type;
  };

  return (
    <div className="max-w-md rounded-md border border-blue-400 bg-gray-800 p-2 opacity-80 shadow-lg">
      <p className="mb-1 text-xs text-gray-400">{getElementTypeName(element.type)}</p>
      <p className="overflow-hidden text-sm overflow-ellipsis whitespace-nowrap text-white">
        {text || 'Пустой элемент'}
      </p>
    </div>
  );
};

export default DragOverlayContent;
