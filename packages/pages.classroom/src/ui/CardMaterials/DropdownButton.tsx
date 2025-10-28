import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { AccessModeT } from 'common.types';

const options: { value: AccessModeT; label: string }[] = [
  { value: 'read_only', label: 'только репетитор' },
  { value: 'no_access', label: 'черновик' },
  { value: 'read_write', label: 'совместная работа' },
];

export const DropdownButton = ({
  studentAccessMode,
  onDelete,
  onUpdateAccessMode,
}: {
  studentAccessMode: AccessModeT | '';
  onDelete?: () => void;
  onUpdateAccessMode?: (newAccessMode: AccessModeT) => void;
}) => {
  const handleChange = (key: AccessModeT) => {
    // Вызываем функцию обновления только если выбран новый режим доступа
    if (key !== studentAccessMode) {
      onUpdateAccessMode?.(key);
    }
  };

  const checkboxItemClassName =
    'hover:bg-brand-0 hover:text-brand-100 relative flex w-full flex-row-reverse items-center justify-start gap-2 px-2 py-[6px] hover:rounded-lg [&>span.absolute]:static [&>span.absolute]:left-auto [&>span.absolute]:ml-2 [&>span>svg]:relative [&>span>svg]:top-[1px]';

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
      <DropdownMenu>
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
          className="border-gray-10 bg-gray-0 text-xs-base w-[182px] rounded-lg border p-2 font-normal"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              поменять доступ
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent
              alignOffset={-16}
              sideOffset={16}
              className="border-gray-10 bg-gray-0 text-xs-base mt-2 rounded-lg border p-2 font-normal"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              {options.map(({ value, label }) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={studentAccessMode === value}
                  onCheckedChange={() => handleChange(value)}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                  className={cn(
                    checkboxItemClassName,
                    studentAccessMode === value
                      ? 'bg-brand-0 text-brand-100 cursor-pointer rounded-lg'
                      : 'text-gray-80 cursor-pointer',
                  )}
                >
                  <div className="w-full text-left">{label}</div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="hover:bg-brand-0 hover:text-brand-100 w-full px-2 py-[6px] hover:rounded-lg"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            редактировать
          </DropdownMenuItem>

          <DropdownMenuItem
            className="hover:bg-brand-0 hover:text-brand-100 w-full px-2 py-[6px] hover:rounded-lg"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.();
            }}
          >
            удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
