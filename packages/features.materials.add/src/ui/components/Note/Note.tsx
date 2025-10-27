import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@xipkg/dropdown';
import { ChevronSmallBottom } from '@xipkg/icons';

interface NoteProps {
  onCreate: () => void;
}

export const Note = ({ onCreate }: NoteProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group bg-gray-0 text-s-base hover:text-gray-0 hover:bg-brand-80 data-[state=open]:text-gray-0 data-[state=open]:bg-brand-80 border-gray-30 flex h-8 w-[160px] flex-row items-center justify-between gap-2 rounded-lg border px-2 font-medium text-gray-100 transition-colors duration-200 hover:border-gray-50 max-[550px]:hidden">
        <span>Создать заметку</span>

        <ChevronSmallBottom className="group-hover:fill-gray-0 group-data-[state=open]:fill-gray-0 h-[16px] w-[16px] fill-gray-100 transition-transform duration-200 group-data-[state=open]:rotate-180" />
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
