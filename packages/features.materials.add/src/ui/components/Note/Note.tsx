import { useState } from 'react';

import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@xipkg/dropdown';
import { ChevronSmallBottom, ChevronSmallTop } from '@xipkg/icons';

interface NoteProps {
  onCreate: () => void;
}

export const Note = ({ onCreate }: NoteProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-lg max-[550px]:hidden">
        <Button
          size="s"
          variant="secondary"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="flex h-[32px] w-[159px] flex-row items-center gap-[6px] rounded-lg border border-gray-50 px-1"
        >
          <span className="text-s-base font-medium">Создать заметку</span>
          {isOpen ? (
            <ChevronSmallTop className="fill-gray-0 h-[16px] w-[16px]" />
          ) : (
            <ChevronSmallBottom className="h-[16px] w-[16px] fill-gray-100" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-gray-10 text-s-base w-[160px] border p-1 font-normal">
        <DropdownMenuLabel className="text-brand-100 bg-brand-0 rounded-lg px-2 py-[6px]">
          Совместная работа
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreate}>Только репетитор</DropdownMenuItem>
        <DropdownMenuItem onClick={onCreate}>Черновики</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
