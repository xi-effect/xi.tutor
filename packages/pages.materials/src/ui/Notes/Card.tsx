import React, { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';

import { MaterialPropsT } from '../../types';
import { formatToShortDate } from '../../utils';
import { useDeleteMaterials } from 'common.services';
import { useMaterialsDuplicate } from '../../provider/MaterialsDuplicateContext';

export const Card: React.FC<MaterialPropsT> = ({ id, updated_at, name, content_kind }) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { deleteMaterials } = useDeleteMaterials();
  const { openModal } = useMaterialsDuplicate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу заметки
    setDropdownOpen(false);

    deleteMaterials.mutate({
      id: id.toString(),
      content_kind: content_kind as 'note' | 'board',
      name,
    });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу заметки
    setDropdownOpen(false);
    openModal(id);
  };

  return (
    <div
      onClick={() => {
        // Сохраняем только параметр call при переходе
        const filteredSearch = search.call ? { call: search.call } : {};

        navigate({
          to: `/note/${id}`,
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            ...filteredSearch,
          }),
        });
      }}
      className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex cursor-pointer justify-between rounded-2xl border p-4"
    >
      <div className="flex flex-col gap-1 overflow-hidden">
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="text-l-base line-clamp-2 w-full font-medium text-gray-100">
            <p className="truncate">{name}</p>
          </div>
          <div className="text-s-base text-gray-60 font-normal">
            Обновлено: {formatToShortDate(updated_at)}
          </div>
        </div>
      </div>

      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
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
  );
};
