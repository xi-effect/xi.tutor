import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
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
  Row,
} from '@tanstack/react-table';
import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import { useMediaQuery, cn } from '@xipkg/utils';
import { RefObject } from 'react';
import { EmptyPaymentsFull } from 'common.ui';
import { Loader } from './Loader';
import { UserRoleT } from '../../../common.api/src/types';
import { RolePaymentT as CommonRolePaymentT } from 'common.types';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { InvoiceCard } from 'features.invoice.card';

/** База знаний — как в блоке «Оплата» на главной */
const PAYMENTS_HELP_URL = 'https://support.sovlium.ru/payments';

const emptyPaymentsHelpLinkClass =
  'bg-gray-5 hover:bg-gray-10 text-xs-base h-8 rounded-lg px-4 font-medium text-gray-80';

export type VirtualizedPaymentsTableProps<T> = {
  parentRef: RefObject<HTMLDivElement | null>;
  data: T[];
  columns: ColumnDef<RolePaymentT<UserRoleT>>[];
  filterByClass?: boolean | string;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  isError: boolean;
  currentUserRole: RoleT;
  onViewInvoice?: (payment: CommonRolePaymentT<UserRoleT>) => void;
};

export const VirtualizedPaymentsTable = ({
  parentRef,
  data,
  columns,
  isLoading = false,
  isFetchingNextPage = false,
  isError,
  currentUserRole,
  onViewInvoice,
}: VirtualizedPaymentsTableProps<RolePaymentT<UserRoleT>>) => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const notFoundItems = !data.length && !isLoading && !isError && !isFetchingNextPage;
  const isTutor = currentUserRole === 'tutor';

  if (notFoundItems) {
    return (
      <div className="box-border flex h-[calc(100dvh-88px)] w-full flex-col px-4 pt-2 pr-5 pb-4">
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-hidden',
            'px-6 py-10 sm:gap-10 sm:px-8 sm:py-12',
          )}
        >
          <div className="flex max-w-md flex-col gap-2 text-center">
            <p className="text-l-base font-semibold text-gray-100">
              {isTutor ? 'Пока нет выставленных счетов' : 'Пока нет счетов'}
            </p>
            <p className="text-s-base text-gray-60 dark:text-gray-50">
              {isTutor
                ? 'Создайте счёт на оплату — он появится в этом списке.'
                : 'Когда репетитор выставит счёт, он отобразится здесь.'}
            </p>
            {isTutor ? (
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="none"
                  className={emptyPaymentsHelpLinkClass}
                  onClick={() => window.open(PAYMENTS_HELP_URL, '_blank', 'noopener,noreferrer')}
                  data-umami-event="payments-page-empty-help"
                >
                  Подробнее о том, как работают оплаты
                  <ArrowUpRight className="fill-gray-80 ml-1 size-4 shrink-0" />
                </Button>
              </div>
            ) : null}
          </div>
          <div className="flex w-full shrink-0 justify-center px-2" aria-hidden>
            <EmptyPaymentsFull className="h-auto max-h-[min(42vh,360px)] w-full max-w-[min(92vw,420px)] object-contain sm:max-h-[min(48vh,400px)]" />
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-[calc(100dvh-224px)] min-h-0 flex-1 overflow-auto">
        <div ref={parentRef} className="bg-gray-5 w-full pr-4 pl-5">
          <GridVirtualizer
            parentRef={parentRef}
            items={data}
            gap={12}
            isSingleColumn
            defaultRowHeight={100}
            renderItem={(item) => {
              return (
                <InvoiceCard
                  payment={item}
                  currentUserRole={currentUserRole}
                  variant="table"
                  onViewInvoice={onViewInvoice}
                />
              );
            }}
          />

          {/* Индикатор загрузки */}
          <Loader isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
        </div>
      </div>
    );
  }

  const { rows } = table.getFilteredRowModel();

  return (
    <div className="pl-5">
      <Table className="xs:rounded-tl-2xl bg-gray-0 table-fixed rounded-none">
        <TableHeader>
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

      <div className="bg-gray-0 h-[calc(100dvh-184px)] min-h-0 flex-1 overflow-auto px-2">
        <div ref={parentRef}>
          <GridVirtualizer<Row<RolePaymentT<UserRoleT>>>
            parentRef={parentRef}
            items={rows}
            isSingleColumn
            defaultRowHeight={50}
            renderItem={(item) => (
              <Table className="table-fixed px-2">
                <TableRow className="group hover:shadow-[0_0_0_1px_var(--xi-gray-30)]">
                  {item.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              </Table>
            )}
          />

          {/* Индикатор загрузки */}
          <Loader isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
        </div>
      </div>
    </div>
  );
};
