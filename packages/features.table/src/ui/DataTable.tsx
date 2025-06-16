import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './TableParts';
import { DropdownFilters } from './DropdownFilters';

import { DataTableProps, TableMetaI } from '../types';

declare module '@tanstack/react-table' {
  interface TableMeta<TData> extends TableMetaI {
    _data?: TData;
  }
}

export const DataTable = <TData,>({
  data,
  columns,
  students = [],
  subjects = [],
}: DataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      students,
      subjects,
    },
  });

  return (
    <Table className="p-2">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} style={{ width: header.getSize() }}>
                <div className="flex h-8 items-center gap-1 justify-self-start">
                  <div className="text-gray-60 text-m-base font-medium">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>

                  {header.column.getCanFilter() && (
                    <DropdownFilters column={header.column} table={table} />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {table.getFilteredRowModel().rows.map((row) => (
          <TableRow className="hover:shadow-[0_0_0_1px_var(--xi-gray-30)]" key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
