import { useState } from 'react';
import { AccessModeT, MaterialActionsMenuPropsT } from 'common.types';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { cn } from '@xipkg/utils';

const options: { value: AccessModeT; label: string }[] = [
  { value: 'read_only', label: 'только репетитор' },
  { value: 'no_access', label: 'черновик' },
  { value: 'read_write', label: 'совместная работа' },
];

export const MaterialActionsMenu = ({
  isClassroom,
  isTutor,
  studentAccessMode,
  onDelete,
  onDeleteFromClassroom,
  onUpdateAccessMode,
  onDuplicate,
  setModalOpen,
}: MaterialActionsMenuPropsT) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);

    action();
  };

  const handleChange = (key: AccessModeT) => {
    if (key !== studentAccessMode) {
      onUpdateAccessMode?.(key);
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
          className="h-8 min-h-8 w-8 min-w-8"
          variant="ghost"
          size="icon"
        >
          <MoreVert className="h-4 w-4 dark:fill-gray-100" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className="border-gray-10 bg-gray-0 w-48 space-y-1 rounded-lg border p-2 font-normal"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {isClassroom && isTutor ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="text-xs-base h-7 gap-2 rounded-lg"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              Поменять доступ
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent
              sideOffset={16}
              className="border-gray-10 bg-gray-0 space-y-1 rounded-lg border p-2 font-normal"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              {options.map(({ value, label }) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={studentAccessMode === value}
                  onCheckedChange={() => handleChange(value)}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                  className={cn(
                    'text-xs-base h-7 rounded-lg',
                    studentAccessMode === value
                      ? 'bg-brand-0 text-brand-100 cursor-pointer'
                      : 'text-gray-80 cursor-pointer',
                  )}
                >
                  <div className="text-xs-base w-full text-left">{label}</div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem
            className="text-xs-base hover:text-brand-100 h-7 rounded-lg px-2"
            onClick={handleAction(onDuplicate)}
          >
            Дублировать в кабинет
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="hover:bg-brand-0 hover:text-brand-100 text-xs-base h-7 w-full rounded-lg px-2"
          onClick={() => setModalOpen(true)}
        >
          Редактировать
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-brand-0 hover:text-brand-100 text-xs-base h-7 w-full rounded-lg px-2"
          onClick={handleAction(isClassroom ? onDeleteFromClassroom : onDelete)}
        >
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
