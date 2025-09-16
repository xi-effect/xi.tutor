/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { FloatingMenu } from '@tiptap/react/menus';
import { Editor } from '@tiptap/core';
import { Plus, Text, H1, H2, H3 } from '@xipkg/icons';

type FloatingMenuToolkitProps = {
  editor: Editor;
  isReadOnly?: boolean;
};

export const FloatingMenuWrapper: React.FC<FloatingMenuToolkitProps> = ({ editor, isReadOnly }) => {
  if (isReadOnly) return null;

  return (
    <FloatingMenu
      editor={editor}
      className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
      shouldShow={({ state }) => {
        const { selection } = state;
        const { $from } = selection;
        const currentLineHasContent = $from.parent.textContent.length > 0;

        // Показываем меню только если строка пустая и курсор в начале
        return !currentLineHasContent && $from.parentOffset === 0;
      }}
      // @ts-ignore
      tippyOptions={{
        duration: 100,
        placement: 'left-start',
        interactive: true,
      }}
    >
      <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-500">
        <Plus size="sm" />
        <span>Добавить блок</span>
      </div>

      <div className="flex flex-col gap-1">
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
          title="Обычный текст"
        >
          <Text size="sm" />
          <span>Текст</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
          title="Заголовок 1"
        >
          <H1 size="sm" />
          <span>Заголовок 1</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
          title="Заголовок 2"
        >
          <H2 size="sm" />
          <span>Заголовок 2</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
          title="Заголовок 3"
        >
          <H3 size="sm" />
          <span>Заголовок 3</span>
        </button>
      </div>
    </FloatingMenu>
  );
};
