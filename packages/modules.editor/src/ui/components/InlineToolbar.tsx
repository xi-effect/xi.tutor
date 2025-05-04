import React, { useEffect, useState } from 'react';
import { Editor, Range } from 'slate';
import { useSlate } from 'slate-react';

/**
 * Компонент панели инструментов форматирования текста
 * Появляется при выделении текста в редакторе
 */
export const InlineToolbar: React.FC = () => {
  const editor = useSlate();
  const [showToolbar, setShowToolbar] = useState(false);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  // Проверка активных форматов текста
  const isMarkActive = (format: string) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  // Проверка, выделен ли текст
  const hasSelection = () => {
    return editor.selection && !Range.isCollapsed(editor.selection);
  };

  // Применение форматирования к тексту
  const toggleMark = (format: string) => {
    const isActive = isMarkActive(format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  // Обновление позиции панели инструментов
  const updateToolbarPosition = () => {
    try {
      if (!hasSelection()) {
        setShowToolbar(false);
        return;
      }

      const domSelection = window.getSelection();
      if (!domSelection || domSelection.rangeCount === 0) {
        setShowToolbar(false);
        return;
      }

      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        setShowToolbar(false);
        return;
      }

      // Вычисляем позицию над выделенным текстом
      setPosition({
        top: rect.top - 40 + window.scrollY,
        left: rect.left + rect.width / 2 - 100, // Центрируем по выделению
      });

      setShowToolbar(true);
    } catch (error) {
      console.error('Failed to update toolbar position:', error);
      setShowToolbar(false);
    }
  };

  // Обработка события выделения текста
  useEffect(() => {
    const handleSelectionChange = () => {
      if (hasSelection()) {
        updateToolbarPosition();
      } else {
        setShowToolbar(false);
      }
    };

    // Подписываемся на изменения выделения
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editor.selection]);

  // Если нет активного выделения, не показываем панель
  if (!showToolbar) {
    return null;
  }

  return (
    <div
      className="fixed z-50 flex rounded-md border border-gray-700 bg-gray-800 p-1 shadow-md"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button
        className={`mx-1 rounded-sm p-1 ${isMarkActive('bold') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark('bold');
        }}
        title="Жирный"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.6 11.8C16.57 10.63 17.25 9.14 17.25 8C17.25 5.78 15.5 4 13.38 4H7V18H14.1C16.07 18 17.75 16.3 17.75 14.25C17.75 12.87 16.9 11.72 15.6 11.8ZM10 6.5H13C13.83 6.5 14.5 7.17 14.5 8C14.5 8.83 13.83 9.5 13 9.5H10V6.5ZM13.5 15.5H10V12.5H13.5C14.33 12.5 15 13.17 15 14C15 14.83 14.33 15.5 13.5 15.5Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <button
        className={`mx-1 rounded-sm p-1 ${isMarkActive('italic') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark('italic');
        }}
        title="Курсив"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 5V7H12.21L8.79 17H6V19H14V17H11.79L15.21 7H18V5H10Z" fill="currentColor" />
        </svg>
      </button>

      <button
        className={`mx-1 rounded-sm p-1 ${isMarkActive('underline') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark('underline');
        }}
        title="Подчеркнутый"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 17C15.31 17 18 14.31 18 11V3H15.5V11C15.5 12.93 13.93 14.5 12 14.5C10.07 14.5 8.5 12.93 8.5 11V3H6V11C6 14.31 8.69 17 12 17ZM5 19V21H19V19H5Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <button
        className={`mx-1 rounded-sm p-1 ${isMarkActive('strikethrough') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark('strikethrough');
        }}
        title="Зачеркнутый"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 19H14V17H10V19ZM5 4V7H7V4H17V7H19V4C19 2.9 18.1 2 17 2H7C5.9 2 5 2.9 5 4ZM5 10H19V13H5V10ZM7 20H17C18.1 20 19 19.1 19 18V16H17V18H7V16H5V18C5 19.1 5.9 20 7 20Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
};
