import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  RolePaymentT,
  RoleT,
} from 'features.table';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ScrollArea } from '@xipkg/scrollarea';
import { useMediaQuery } from '@xipkg/utils';
import { RefObject } from 'react';
import { CardsList } from './Mobile';
import { NotFoundItems } from './NotFoundItems';
import { useResponsiveGrid, useVirtualGrid } from '../hooks';
import { Loader } from './Loader';
import { type TabsComponentPropsT } from '../types';

export type VirtualizedPaymentsTableProps<T> = {
  parentRef: RefObject<HTMLDivElement | null>;
  data: T[];
  columns: ColumnDef<RolePaymentT>[];
  filterByClass?: boolean | string;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onApprovePayment: TabsComponentPropsT['onApprovePayment'];
  isError: boolean;
  currentUserRole: RoleT;
};

export const VirtualizedPaymentsTable = ({
  parentRef,
  data,
  columns,
  isLoading = false,
  isFetchingNextPage = false,
  onApprovePayment,
  isError,
  currentUserRole,
}: VirtualizedPaymentsTableProps<RolePaymentT>) => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getFilteredRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Примерная высота строки
    overscan: 5,
  });

  const { colCount, rowHeight, GAP } = useResponsiveGrid(parentRef);
  const gridRowVirtualizer = useVirtualGrid(parentRef, data, colCount, rowHeight);

  const notFoundItems = !data.length && !isLoading && !isError && !isFetchingNextPage;

  if (notFoundItems) {
    return <NotFoundItems text="Здесь пока нет оплат" />;
  }

  if (isMobile) {
    return (
      <CardsList
        data={data}
        onApprovePayment={onApprovePayment}
        rowVirtualizer={gridRowVirtualizer}
        parentRef={parentRef}
        colCount={colCount}
        gap={GAP}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        currentUserRole={currentUserRole}
      />
    );
  }

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
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>

        <div ref={parentRef} className="h-[calc(100vh-242px)] w-full overflow-y-auto">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <Table className="table-fixed px-2">
                    <TableBody>
                      <TableRow className="group hover:shadow-[0_0_0_1px_var(--xi-gray-30)]">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>

          {/* Индикатор загрузки */}
          <Loader isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
        </div>
      </div>
    </ScrollArea>
  );
};
