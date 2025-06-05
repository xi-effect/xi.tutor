import { Column, Table as TableType } from '@tanstack/react-table';
import { useState } from 'react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { ChevronSmallBottom, ChevronSmallTop } from '@xipkg/icons';

import { getFilterComponentMap } from './filterComponentMap';
import { FilterColumnId } from '../types';

interface DropdownFiltersProps<TData> {
  column: Column<TData, unknown>;
  table: TableType<TData>;
}

export const DropdownFilters = <TData,>({ column, table }: DropdownFiltersProps<TData>) => {
  const [isOpen, setIsOpen] = useState(false);

  const columnId = column.id as FilterColumnId;
  const filterComponent = getFilterComponentMap(column, table)[columnId]?.() ?? null;

  if (!filterComponent) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="s">
          {isOpen ? <ChevronSmallTop size="sm" /> : <ChevronSmallBottom size="sm" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[200px] p-4">{filterComponent}</DropdownMenuContent>
    </DropdownMenu>
  );
};
