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
    <div className="overflow-x-auto">
      <div className="relative">
        <Table className="w-full table-fixed px-2">
          <TableHeader className="bg-gray-0 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead style={{ width: header.getSize() }} key={header.id}>
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
        </Table>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <Table className="w-full table-fixed px-2">
            <TableBody>
              {table.getFilteredRowModel().rows.map((row) => (
                <TableRow className="group hover:shadow-[0_0_0_1px_var(--xi-gray-30)]" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
