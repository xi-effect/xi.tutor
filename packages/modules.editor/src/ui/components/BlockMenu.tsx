import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Copy, H1, H2, H3, Text, Trash, Image, ArrowUp, ArrowBottom } from '@xipkg/icons';
import { ReactNode } from 'react';
import { useBlockMenuActions } from '../../hooks';
import { Editor } from '@tiptap/core';
import { useInterfaceStore } from '../../store/interfaceStore';
import { ActiveBlockT } from '../../types';

type BlockMenuPropsT = {
  children: ReactNode;
  editor: Editor;
  isReadOnly?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  getActiveBlock: () => ActiveBlockT | undefined;
};

// оборачивает действие так чтобы оно выполнилось ПОСЛЕ того как DropdownMenu закончит своё закрытие/анимацию.
// Это исключает вызов view.dispatch() внутри React-рендера Radix.
function deferAction(fn: () => void) {
  return (e: Event) => {
    e.preventDefault();
    setTimeout(fn, 0);
  };
}

export const BlockMenu = ({
  children,
  editor,
  isReadOnly,
  open,
  setOpen,
  getActiveBlock,
}: BlockMenuPropsT) => {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const { openModal } = useInterfaceStore();
  const { changeType, duplicate, remove, moveUp, moveDown } = useBlockMenuActions(
    editor,
    getActiveBlock,
  );

  // Блокируем меню если редактор в readonly режиме
  const shouldShow = editor && !isReadOnly && editor.isEditable !== false;

  if (!shouldShow) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        className="flex w-auto flex-col gap-1 space-y-1 p-2"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => changeType('paragraph')}
        >
          <Text size="sm" className="size-6" />
          <span className="text-sm">Текст</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => changeType('heading1')}
        >
          <H1 size="sm" className="size-6" />
          <span className="text-sm">Заголовок 1</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => changeType('heading2')}
        >
          <H2 size="sm" className="size-6" />
          <span className="text-sm">Заголовок 2</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => changeType('heading3')}
        >
          <H3 size="sm" className="size-6" />
          <span className="text-sm">Заголовок 3</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => openModal('uploadImage')}
        >
          <Image size="sm" className="size-6" />
          <span className="text-sm">Изображение</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="hover:bg-gray-5 h-7 gap-2 rounded p-1" onSelect={duplicate}>
          <Copy size="sm" className="size-6" />
          <span className="text-sm">Дублировать</span>
          <span className="text-xxs-base ml-auto text-gray-50">
            {isMac ? '⌘+⇧+D' : 'Ctrl+Shift+D'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={deferAction(moveUp)}
        >
          <ArrowUp size="sm" className="size-6" />
          <span className="text-sm">Переместить вверх</span>
          <span className="text-xxs-base ml-auto text-gray-50">
            {isMac ? '⌘+⇧+↑' : 'Ctrl+Shift+↑'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={deferAction(moveDown)}
        >
          <ArrowBottom size="sm" className="size-6" />
          <span className="text-sm">Переместить вниз</span>
          <span className="text-xxs-base ml-auto text-gray-50">
            {isMac ? '⌘+⇧+↓' : 'Ctrl+Shift+↓'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className="hover:bg-gray-5 h-7 gap-2 rounded p-1" onSelect={remove}>
          <Trash size="sm" className="size-6" />
          <span className="text-sm">Удалить</span>
          <span className="text-xxs-base ml-auto text-gray-50">{isMac ? '⌘+⌫' : 'Del'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
