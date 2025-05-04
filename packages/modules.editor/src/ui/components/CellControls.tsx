/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useSlate } from 'slate-react';
import { Transforms } from 'slate';

interface CellControlsProps {
  listeners: Record<string, any>;
  nodeId: string;
  nodeType: string;
}

/**
 * Компонент для отображения элементов управления ячейкой/блоком редактора
 * Позволяет перетаскивать, удалять и изменять тип блока
 */
export const CellControls: React.FC<CellControlsProps> = ({ listeners, nodeId, nodeType }) => {
  const editor = useSlate();
  const [showMenu, setShowMenu] = useState(false);

  // Удаление текущего блока
  const handleDelete = () => {
    Transforms.removeNodes(editor, {
      at: [],
      match: (n) => n.id === nodeId,
    });
  };

  // Преобразуем тип блока в удобочитаемое название
  const getTypeLabel = (type: string): string => {
    const typeMapping: Record<string, string> = {
      paragraph: 'Абзац',
      'bulleted-list': 'Маркированный список',
      'numbered-list': 'Нумерованный список',
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
    <div className="absolute top-0 -left-12 z-10 flex items-start gap-2">
      {/* Кнопка перетаскивания */}
      <button
        type="button"
        className="cursor-grab p-1 text-gray-400 hover:text-gray-100 active:cursor-grabbing"
        {...listeners}
        title="Перетащить"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 6H10V8H8V6ZM14 6H16V8H14V6ZM8 11H10V13H8V11ZM14 11H16V13H14V11ZM8 16H10V18H8V16ZM14 16H16V18H14V16Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Контейнер для действий */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-gray-400 hover:text-gray-100"
          title="Меню"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Выпадающее меню */}
        {showMenu && (
          <div className="absolute top-0 left-full ml-2 min-w-32 rounded-md border border-gray-700 bg-gray-800 py-1 shadow-lg">
            <div className="border-b border-gray-700 px-3 py-1 text-xs text-gray-400">
              {getTypeLabel(nodeType)}
            </div>

            <button
              type="button"
              onClick={handleDelete}
              className="w-full px-3 py-1 text-left text-sm text-red-400 hover:bg-gray-700"
            >
              Удалить
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
