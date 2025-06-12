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
import { ScrollArea } from '@xipkg/scrollarea';

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
    <ScrollArea
      scrollBarProps={{ orientation: 'horizontal' }}
      type="always"
      className="h-[calc(100vh-164px)] w-full overflow-x-auto overflow-y-hidden"
    >
      <div className="min-w-[1200px]">
        <Table className="table-fixed px-2">
          <TableHeader className="sticky top-0 z-10 bg-transparent">
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

        <div className="h-[calc(100vh-242px)] w-full overflow-y-auto">
          <Table className="table-fixed px-2">
            <TableBody className="">
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
    </ScrollArea>
  );
};
