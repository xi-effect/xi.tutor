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

const menuItemClass =
  'text-gray-100 hover:bg-gray-5 focus:text-gray-100 fill-gray-80 [&_svg]:fill-gray-80 h-7 gap-2 rounded p-1 text-sm';

type BlockMenuPropsT = {
  children: ReactNode;
  editor: Editor;
  isReadOnly?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  activeBlock?: ActiveBlockT;
};

export const BlockMenu = ({
  children,
  editor,
  isReadOnly,
  open,
  setOpen,
  activeBlock,
}: BlockMenuPropsT) => {
  const { openModal } = useInterfaceStore();
  const { changeType, duplicate, remove, moveUp, moveDown } = useBlockMenuActions(
    editor,
    activeBlock,
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
        className="border-gray-10 bg-gray-0 flex w-auto flex-col gap-1 space-y-1 rounded-lg border p-2 text-gray-100"
      >
        <DropdownMenuItem className={menuItemClass} onSelect={() => changeType('paragraph')}>
          <Text size="sm" className="size-6" />
          <span>Текст</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => changeType('heading1')}>
          <H1 size="sm" className="size-6" />
          <span>Заголовок 1</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => changeType('heading2')}>
          <H2 size="sm" className="size-6" />
          <span>Заголовок 2</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => changeType('heading3')}>
          <H3 size="sm" className="size-6" />
          <span>Заголовок 3</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => openModal('uploadImage')}>
          <Image size="sm" className="size-6" />
          <span>Изображение</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className={menuItemClass} onSelect={duplicate}>
          <Copy size="sm" className="size-6" />
          <span>Дублировать</span>
          <span className="text-gray-60 ml-auto text-[10px] leading-[14px]">Ctrl+D</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={moveUp}>
          <ArrowUp size="sm" className="size-6" />
          <span>Переместить вверх</span>
          <span className="text-gray-60 ml-auto text-[10px] leading-[14px]">⌘⇧↑</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={moveDown}>
          <ArrowBottom size="sm" className="size-6" />
          <span>Переместить вниз</span>
          <span className="text-gray-60 ml-auto text-[10px] leading-[14px]">⌘⇧↓</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={remove}>
          <Trash size="sm" className="size-6" />
          <span>Удалить</span>
          <span className="text-gray-60 ml-auto text-[10px] leading-[14px]">Del</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
