import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  StudentT,
  SubjectT,
  DropdownFilters,
} from 'features.table';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

export type PaymentsTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  students?: StudentT[];
  subjects?: SubjectT[];
};

export const PaymentsTable = <TData,>({
  data,
  columns,
  students = [],
  subjects = [],
}: PaymentsTableProps<TData>) => {
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
    <Table className="pr-2">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
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
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
