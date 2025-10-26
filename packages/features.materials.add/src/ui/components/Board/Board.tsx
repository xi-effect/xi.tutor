import { useState } from 'react';

import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@xipkg/dropdown';
import { ChevronSmallBottom } from '@xipkg/icons';

interface BoardProps {
  onCreate: () => void;
}

export const Board = ({ onCreate }: BoardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="rounded-lg max-[550px]:hidden">
        <Button
          size="s"
          variant="secondary"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="flex w-[160px] flex-row items-center gap-[6px] rounded-lg border border-gray-50"
        >
          <span className="text-s-base font-medium">Создать доску</span>
          {isOpen ? (
            <ChevronSmallBottom className="fill-gray-0 h-[16px] w-[16px] rotate-180" />
          ) : (
            <ChevronSmallBottom className="h-[16px] w-[16px] fill-gray-100" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-gray-10 text-s-base w-[160px] border p-1 font-normal">
        <DropdownMenuItem
          onClick={onCreate}
          className="hover:bg-brand-0 hover:text-brand-100 py-6 hover:rounded-lg"
        >
          Совместная работа
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onCreate}
          className="hover:bg-brand-0 hover:text-brand-100 hover:rounded-lg"
        >
          Только репетитор
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onCreate}
          className="hover:bg-brand-0 hover:text-brand-100 hover:rounded-lg"
        >
          Черновики
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
