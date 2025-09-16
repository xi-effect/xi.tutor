import { useState } from 'react';
import { Editor } from '@tiptap/core';
import { Move, MoreVert, Trash, Copy, Text, H1, H2, H3 } from '@xipkg/icons';
import DragHandle from '@tiptap/extension-drag-handle-react';

export const DragHandleWrapper = ({
  editor,
  onDragStart,
  onDragEnd,
  isReadOnly = false,
}: {
  editor: Editor;
  onDragStart: () => void;
  onDragEnd: () => void;
  isReadOnly?: boolean;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDuplicate = () => {
    const { state } = editor.view;
    const { selection } = state;
    const { $from } = selection;

    // Получаем текущий узел
    const node = $from.parent;
    const nodeType = node.type;

    // Создаем копию узла
    const newNode = nodeType.create(node.attrs, node.content);

    // Вставляем после текущего узла
    editor
      .chain()
      .focus()
      .insertContentAt($from.end() + 1, newNode)
      .run();

    setShowMenu(false);
  };

  const handleDelete = () => {
    const { state } = editor.view;
    const { selection } = state;
    const { $from } = selection;

    // Удаляем текущий узел
    editor
      .chain()
      .focus()
      .deleteRange({ from: $from.start() - 1, to: $from.end() + 1 })
      .run();

    setShowMenu(false);
  };

  const handleChangeType = (type: 'paragraph' | 'heading1' | 'heading2' | 'heading3') => {
    // const { state } = editor.view;
    // const { selection } = state;
    // const { $from } = selection;

    switch (type) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
    }

    setShowMenu(false);
  };

  if (isReadOnly) return null;

  return (
    <DragHandle editor={editor}>
      <div className="flex items-center gap-1">
        <div
          className="cursor-grab rounded p-1 hover:bg-gray-100 active:cursor-grabbing"
          draggable
          onDragStart={onDragStart}
          onDragEnd={(e) => {
            e.preventDefault();
            onDragEnd();
          }}
          title="Перетащить блок"
        >
          <Move size="sm" />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="cursor-pointer rounded p-1 hover:bg-gray-100"
            title="Меню блока"
          >
            <MoreVert size="sm" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute top-0 left-6 z-20 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                <button
                  onClick={handleDuplicate}
                  className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
                  title="Дублировать блок"
                >
                  <Copy size="sm" />
                  <span>Дублировать</span>
                </button>

                <div className="border-t border-gray-200" />

                <button
                  onClick={() => handleChangeType('paragraph')}
                  className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
                  title="Обычный текст"
                >
                  <Text size="sm" />
                  <span>Текст</span>
                </button>

                <button
                  onClick={() => handleChangeType('heading1')}
                  className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
                  title="Заголовок 1"
                >
                  <H1 size="sm" />
                  <span>Заголовок 1</span>
                </button>

                <button
                  onClick={() => handleChangeType('heading2')}
                  className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
                  title="Заголовок 2"
                >
                  <H2 size="sm" />
                  <span>Заголовок 2</span>
                </button>

                <button
                  onClick={() => handleChangeType('heading3')}
                  className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
                  title="Заголовок 3"
                >
                  <H3 size="sm" />
                  <span>Заголовок 3</span>
                </button>

                <div className="border-t border-gray-200" />

                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm text-red-600 hover:bg-red-50"
                  title="Удалить блок"
                >
                  <Trash size="sm" />
                  <span>Удалить</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DragHandle>
  );
};
