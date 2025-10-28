import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { formatToShortDate } from 'pages.materials';
import { BoardT, NoteT } from '../../mocks';

type CardProps = {
  value: BoardT | NoteT;
  onClick: () => void;
  onDelete?: () => void;
};

export const Card = ({ value, onClick, onDelete }: CardProps) => {
  const { name, updated_at } = value;

  return (
    <div
      onClick={onClick}
      className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex h-[96px] w-[430px] cursor-pointer justify-between rounded-2xl border p-4"
    >
      <div className="flex h-full w-[350px] flex-col gap-1 overflow-hidden">
        <div className="flex h-full flex-col gap-4">
          <div className="text-l-base line-clamp-2 w-full font-medium text-gray-100">
            <p className="truncate">{name}</p>
          </div>

          <div className="text-s-base text-gray-60 font-normal">
            Обновлено: {formatToShortDate(updated_at)}
          </div>
        </div>
      </div>

      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-6 w-6" variant="ghost" size="icon">
              <MoreVert className="h-4 w-4 dark:fill-gray-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            className="border-gray-10 bg-gray-0 border p-1"
          >
            <DropdownMenuItem>Копировать</DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.();
              }}
            >
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
