import { RenderLeafProps } from 'slate-react';

/**
 * Компонент для рендеринга текстовых узлов (листьев) в редакторе
 * Поддерживает форматирование: жирный, курсив, подчёркнутый, зачёркнутый,
 * а также подсветку синтаксиса кода
 */
export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  let el = <>{children}</>;

  // Применение различных стилей текста
  if (leaf.bold) {
    el = <strong>{el}</strong>;
  }

  if (leaf.italic) {
    el = <em>{el}</em>;
  }

  if (leaf.underline) {
    el = <u>{el}</u>;
  }

  if (leaf.strikethrough) {
    el = <s>{el}</s>;
  }

  if (leaf.prism) {
    // Применяем классы для подсветки синтаксиса
    return (
      <span {...attributes} className={leaf.className}>
        {el}
      </span>
    );
  }

  return <span {...attributes}>{el}</span>;
};
