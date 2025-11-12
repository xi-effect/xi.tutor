import React, { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ClassroomMaterialsT } from 'common.types';
import { formatToShortDate } from 'pages.materials';
import { LongAnswer, WhiteBoard, MoreVert } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { useDeleteMaterials } from 'common.services';
import { useMaterialsDuplicate } from 'pages.materials';

type MaterialProps = {
  material: ClassroomMaterialsT;
  isLoading: boolean;
};

const iconClassName = 'size-6 fill-gray-100';

const mapIcon: Record<'note' | 'board', React.ReactNode> = {
  note: <LongAnswer className={iconClassName} aria-label="note" />,
  board: <WhiteBoard className={iconClassName} aria-label="board" />,
};

export const Material = ({ material, isLoading }: MaterialProps) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { deleteMaterials } = useDeleteMaterials();
  const { openModal } = useMaterialsDuplicate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { id, name, updated_at, content_kind } = material;

  const handleClick = (e: React.MouseEvent) => {
    // Не переходим на страницу материала, если клик был по меню
    if (
      (e.target as HTMLElement).closest('[role="menu"]') ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }

    // Сохраняем параметр call при переходе к материалу
    const filteredSearch = search.call ? { call: search.call } : {};

    const route = content_kind === 'board' ? `/materials/${id}/board` : `/materials/${id}/note`;

    navigate({
      to: route,
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу материала
    setDropdownOpen(false);
    deleteMaterials.mutate({
      id: id.toString(),
      content_kind: content_kind as 'note' | 'board',
      name,
    });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу материала
    setDropdownOpen(false);
    openModal(id);
  };

  return (
    <div
      className="border-gray-60 hover:bg-gray-5 relative flex min-h-[96px] min-w-[350px] cursor-pointer flex-col items-start justify-start gap-2 rounded-2xl border p-4"
      onClick={handleClick}
    >
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <div className="flex w-full min-w-0 flex-1 items-center gap-2">
          {content_kind && mapIcon[content_kind]}
          <h3 className="text-l-base min-w-0 flex-1 overflow-hidden font-medium text-ellipsis whitespace-nowrap text-gray-100">
            {name}
          </h3>
        </div>

        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
              <DropdownMenuItem onClick={handleDuplicate}>Дублировать в кабинет</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete}>Удалить</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-row items-center justify-start gap-2">
        <span className="text-s-base text-gray-80 font-medium">
          Изменено: {isLoading ? '...' : updated_at ? formatToShortDate(updated_at) : ''}
        </span>
      </div>
    </div>
  );
};
