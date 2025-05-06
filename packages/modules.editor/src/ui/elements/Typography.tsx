import React from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * Базовый компонент для отображения текстовых блоков в редакторе
 * Используется для рендеринга параграфов и простых текстовых элементов
 */
export const Typography: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
  ...props
}) => {
  // Получаем текст из дочерних элементов для определения пустого блока
  const isEmpty = React.useMemo(() => {
    if (!element.children || element.children.length === 0) return true;

    // Проверяем, не пустой ли текст
    const textContent = element.children
      .map((child) => ('text' in child ? child.text : ''))
      .join('')
      .trim();

    return textContent === '';
  }, [element.children]);

  return (
    <p
      {...attributes}
      {...props}
      className={`mb-2 text-base leading-relaxed ${isEmpty ? 'before:text-gray-400 before:content-[""]' : ''}`}
    >
      {children}
    </p>
  );
};
