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

/** text-xs-base нельзя вместе с text-gray-* — twMerge снимает цвет текста */
const menuSurfaceClass = 'border-gray-10 bg-gray-0 border';
const menuItemClass =
  'text-gray-100 hover:bg-brand-0 hover:text-gray-100 focus:text-gray-100 min-h-7 h-auto items-start whitespace-nowrap rounded-lg px-2 py-1.5 text-sm leading-snug';

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
          className="group-hover:bg-gray-0 h-8 min-h-8 w-8 min-w-8 rounded-sm"
          variant="none"
          size="icon"
          data-umami-event="material-actions-menu-open"
        >
          <MoreVert className="fill-gray-80 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className={cn(menuSurfaceClass, 'w-56 space-y-1 rounded-lg p-2 font-normal text-gray-100')}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {isClassroom && isTutor ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className={cn(menuItemClass, 'gap-2')}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              data-umami-event="material-change-access-open"
            >
              Поменять доступ
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent
              sideOffset={16}
              className={cn(menuSurfaceClass, 'space-y-1 rounded-lg p-2 font-normal text-gray-100')}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              {options.map(({ value, label }) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={studentAccessMode === value}
                  onCheckedChange={() => handleChange(value)}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                  className={cn(
                    'h-auto min-h-7 cursor-pointer items-start rounded-lg py-1.5 text-sm leading-snug whitespace-normal',
                    studentAccessMode === value
                      ? 'bg-brand-0 text-brand-80'
                      : 'text-gray-100 hover:text-gray-100 focus:text-gray-100',
                  )}
                  data-umami-event="material-access-mode-change"
                  data-umami-event-mode={value}
                  data-umami-event-from={studentAccessMode}
                >
                  <div className="w-full text-left">{label}</div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem
            className={menuItemClass}
            onClick={handleAction(onDuplicate)}
            data-umami-event="material-duplicate-to-classroom"
          >
            Дублировать в кабинет
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className={cn(menuItemClass, 'w-full')}
          onClick={() => setModalOpen(true)}
          data-umami-event="material-edit"
        >
          Редактировать
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(menuItemClass, 'w-full')}
          onClick={handleAction(isClassroom ? onDeleteFromClassroom : onDelete)}
          data-umami-event={isClassroom ? 'material-delete-from-classroom' : 'material-delete'}
        >
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
