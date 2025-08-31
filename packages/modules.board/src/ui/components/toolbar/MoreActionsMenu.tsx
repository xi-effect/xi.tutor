import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MenuDots } from '@xipkg/icons';
import { useState } from 'react';

export const MoreActionsMenu = () => {
  const [isBlocked, setIsBlocked] = useState(false); // просто для наглядности добавлено
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="s" className="hover:bg-brand-0 p-1">
          <MenuDots className="rotate-90" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={8}
        className="border-gray-10 bg-gray-0 fle w-[180px] flex-col gap-2 rounded-xl border p-1"
      >
        <DropdownMenuItem onClick={() => setIsBlocked(!isBlocked)} className="rounded-lg px-3">
          {isBlocked ? 'Разблокировать' : 'Заблокировать'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
