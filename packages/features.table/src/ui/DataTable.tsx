import {
  ColumnDef,
  Column,
  Table as TableType,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './TableParts';

import {
  DateRangeFilter,
  AmountRangeFilter,
  StudentFilter,
  SubjectFilter,
  CheckboxFilter,
} from './Filters';

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@xipkg/dropdown';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@xipkg/button';

interface Student {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    students: Student[];
    subjects: Subject[];
  }
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  students?: Student[];
  subjects?: Subject[];
}

const Filters = <TData,>({
  column,
  table,
}: {
  column: Column<TData, unknown>;
  table: TableType<TData>;
}) => {
  const columnId = column.id;

  const filterComponent: React.ReactNode = (() => {
    if (columnId === 'datePayment') return <DateRangeFilter column={column} />;
    if (columnId === 'amountPayment') return <AmountRangeFilter column={column} />;
    if (columnId === 'idStudent') {
      return <StudentFilter table={table} students={table.options.meta?.students || []} />;
    }
    if (columnId === 'idSubject') {
      return <SubjectFilter column={column} subjects={table.options.meta?.subjects || []} />;
    }
    if (columnId === 'statusPayment') {
      return <CheckboxFilter column={column} options={['done', 'pending', 'canceled']} />;
    }
    if (columnId === 'typePayment') {
      return <CheckboxFilter column={column} options={['наличные', 'перевод']} />;
    }
    return null;
  })();

  if (!filterComponent) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[200px] p-4">{filterComponent}</DropdownMenuContent>
    </DropdownMenu>
  );
};

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
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanFilter() && (
                      <Filters column={header.column} table={table} />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
