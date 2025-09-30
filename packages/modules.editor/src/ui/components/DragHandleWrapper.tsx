import { useState } from 'react';
import { Editor } from '@tiptap/core';
import { Move, Trash, Copy, Text, H1, H2, H3, Close, Plus, Brush, TText } from '@xipkg/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import DragHandle from '@tiptap/extension-drag-handle-react';
import { Button } from '@xipkg/button';

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
      <div className="flex items-center gap-2">
        <DropdownMenu open={showMenu} onOpenChange={() => setShowMenu(!showMenu)}>
          <DropdownMenuTrigger asChild>
            <Button
              className="hover:bg-gray-5 active:bg-gray-5 group h-5 w-5 rounded p-0"
              variant="ghost"
            >
              {showMenu ? <Close size="sm" /> : <Plus size="sm" />}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="start"
            className="flex w-[200px] flex-col space-y-1 p-2"
          >
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="hover:bg-gray-5 h-7 gap-2 rounded p-1">
                <Brush size="sm" />
                <span className="text-sm">Цвет</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="flex w-[200px] flex-col space-y-1 p-2">
                <DropdownMenuGroup>
                  <span className="text-xxs-base text-gray-60 px-1">Цвет</span>
                  <DropdownMenuItem
                    className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                    onSelect={() => console.log('Красный')}
                  >
                    <TText size="sm" />
                    <span className="text-sm">Красный</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                    onSelect={() => console.log('Зелёный')}
                  >
                    <TText size="sm" />
                    <span className="text-sm">Зелёный</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                    onSelect={() => console.log('Синий')}
                  >
                    <TText size="sm" />
                    <span className="text-sm">Синий</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <span className="text-xxs-base text-gray-60 px-1">Цвет</span>
                  <DropdownMenuItem
                    className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                    onSelect={() => console.log('Красный')}
                  >
                    <TText size="sm" />
                    <span className="text-sm">Красный</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                    onSelect={() => console.log('Зелёный')}
                  >
                    <TText size="sm" /> <span className="text-sm">Зелёный</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                    onSelect={() => console.log('Синий')}
                  >
                    <TText size="sm" /> <span className="text-sm">Синий</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
              onSelect={() => handleChangeType('paragraph')}
            >
              <Text size="sm" />
              <span className="text-sm">Текст</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
              onSelect={() => handleChangeType('heading1')}
            >
              <H1 size="sm" />
              <span className="text-sm">Заголовок 1</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
              onSelect={() => handleChangeType('heading2')}
            >
              <H2 size="sm" />
              <span className="text-sm">Заголовок 2</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
              onSelect={() => handleChangeType('heading3')}
            >
              <H3 size="sm" />
              <span className="text-sm">Заголовок 3</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
              onSelect={handleDuplicate}
            >
              <Copy size="sm" />
              <span className="text-sm">Дублировать</span>
              <span className="text-xxs-base ml-auto text-gray-50">Ctrl+D</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
              onSelect={handleDelete}
            >
              <Trash size="sm" />
              <span className="text-sm">Удалить</span>
              <span className="text-xxs-base ml-auto text-gray-50">Del</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className="hover:bg-gray-5 active:bg-gray-5 group h-5 w-5 cursor-grab rounded p-0 active:cursor-grabbing"
          variant="ghost"
          onDragStart={onDragStart}
          onDragEnd={(e) => {
            e.preventDefault();
            onDragEnd();
          }}
          title="Перетащить блок"
        >
          <Move size="sm" />
        </Button>
      </div>
    </DragHandle>
  );
};
