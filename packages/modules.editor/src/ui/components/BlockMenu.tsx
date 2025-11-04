import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Copy, H1, H2, H3, Text, Trash, Image } from '@xipkg/icons';
import { ReactNode, useState } from 'react';
import { useBlockMenuActions, useYjsContext } from '../../hooks';
import { useInterfaceStore } from '../../store/interfaceStore';

type BlockMenuPropsT = {
  children: (props: { open: boolean }) => ReactNode;
};

export const BlockMenu = ({ children }: BlockMenuPropsT) => {
  const [open, setOpen] = useState(false);
  const { editor, isReadOnly } = useYjsContext();
  const { openModal } = useInterfaceStore();

  const { changeType, duplicate, remove } = useBlockMenuActions(editor);

  // Блокируем меню если редактор в readonly режиме
  const shouldShow = editor && !isReadOnly && editor.isEditable !== false;

  if (!shouldShow) {
    // Возвращаем children без DropdownMenu, чтобы не ломать структуру
    return <>{children({ open: false })}</>;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>{children({ open })}</DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        className="flex w-[200px] flex-col space-y-1 p-2"
      >
        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => changeType('paragraph')}
        >
          <Text size="sm" />
          <span className="text-sm">Текст</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => changeType('heading1')}
        >
          <H1 size="sm" />
          <span className="text-sm">Заголовок 1</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => changeType('heading2')}
        >
          <H2 size="sm" />
          <span className="text-sm">Заголовок 2</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => changeType('heading3')}
        >
          <H3 size="sm" />
          <span className="text-sm">Заголовок 3</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
          onSelect={() => openModal('uploadImage')}
        >
          <Image size="sm" />
          <span className="text-sm">Изображение</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="hover:bg-gray-5 h-7 gap-2 rounded p-1" onSelect={duplicate}>
          <Copy size="sm" />
          <span className="text-sm">Дублировать</span>
          <span className="text-xxs-base ml-auto text-gray-50">Ctrl+D</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="hover:bg-gray-5 h-7 gap-2 rounded p-1" onSelect={remove}>
          <Trash size="sm" />
          <span className="text-sm">Удалить</span>
          <span className="text-xxs-base ml-auto text-gray-50">Del</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
