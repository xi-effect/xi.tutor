import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Copy, H1, H2, H3, Text, Trash, Image, ArrowUp, ArrowBottom, Code } from '@xipkg/icons';
import { ReactNode } from 'react';
import { useBlockMenuActions } from '../../hooks';
import { Editor } from '@tiptap/core';
import { useInterfaceStore } from '../../store/interfaceStore';
import { ActiveBlockT } from '../../types';

const menuItemClass =
  'text-text-primary hover:bg-background-page focus:text-text-primary fill-icon-primary [&_svg]:fill-icon-primary h-7 gap-2 rounded p-1 text-sm';

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
  const { insertBlock, duplicate, remove, moveUp, moveDown, insertCode } = useBlockMenuActions(
    editor,
    getActiveBlock,
  );

  // Блокируем меню если редактор в readonly режиме
  const shouldShow = editor && !isReadOnly && editor.isEditable !== false;

  if (!shouldShow) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="border-border-default bg-background-surface text-text-primary flex w-auto flex-col gap-1 space-y-1 rounded-lg border p-2"
      >
        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('paragraph')}>
          <Text size="sm" className="size-6" />
          <span>Текст</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('heading1')}>
          <H1 size="sm" className="size-6" />
          <span>Заголовок 1</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('heading2')}>
          <H2 size="sm" className="size-6" />
          <span>Заголовок 2</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('heading3')}>
          <H3 size="sm" className="size-6" />
          <span>Заголовок 3</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => openModal('uploadImage')}>
          <Image size="sm" className="size-6" />
          <span>Изображение</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={menuItemClass} onSelect={() => insertCode('')}>
          <Code size="sm" className="size-6" />
          <span>Вставить код</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className={menuItemClass} onSelect={duplicate}>
          <Copy size="sm" className="size-6" />
          <span className="text-sm">Дублировать</span>
          <span className="text-xxs-base text-text-muted ml-auto">
            {isMac ? '⌘+⇧+C' : 'Ctrl+Shift+C'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-background-page h-7 gap-2 rounded p-1"
          onSelect={deferAction(moveUp)}
        >
          <ArrowUp size="sm" className="size-6" />
          <span className="text-sm">Переместить вверх</span>
          <span className="text-xxs-base text-text-muted ml-auto">
            {isMac ? '⌘+⇧+↑' : 'Ctrl+Shift+↑'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-background-page h-7 gap-2 rounded p-1"
          onSelect={deferAction(moveDown)}
        >
          <ArrowBottom size="sm" className="size-6" />
          <span className="text-sm">Переместить вниз</span>
          <span className="text-xxs-base text-text-muted ml-auto">
            {isMac ? '⌘+⇧+↓' : 'Ctrl+Shift+↓'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={remove}>
          <Trash size="sm" className="size-6" />
          <span className="text-sm">Удалить</span>
          <span className="text-xxs-base text-text-muted ml-auto">{isMac ? '⌘+⌫' : 'Del'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
