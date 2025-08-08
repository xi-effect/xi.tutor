import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MenuDots } from '@xipkg/icons';

export const EventMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-gray-0 flex h-8 w-8 items-center justify-center text-sm">
        <MenuDots className="rotate-90" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Вырезать</DropdownMenuItem>
        <DropdownMenuItem>Копировать</DropdownMenuItem>
        <DropdownMenuItem>Дублировать</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-80">Удалить</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
