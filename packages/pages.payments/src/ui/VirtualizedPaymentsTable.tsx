import {
  Table,
  TableHeader,
  TableBody,
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
import { useTranslation } from 'react-i18next';
import { EmptyPaymentsFull } from 'common.ui';
import { Loader } from './Loader';
import { PaymentsTableSkeleton } from './PaymentsTableSkeleton';
import { UserRoleT } from '../../../common.api/src/types';
import { RolePaymentT as CommonRolePaymentT } from 'common.types';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { InvoiceCard } from 'features.invoice.card';

/** База знаний — как в блоке «Оплата» на главной */
const PAYMENTS_HELP_URL = 'https://support.sovlium.ru/payments';

const emptyPaymentsHelpLinkClass =
  'bg-background-page hover:bg-background-subtle text-xs-base h-8 rounded-lg px-4 font-medium text-text-primary';

/** Высота под новую шапку (Playfair + pt/mt-10) */
const TABLE_SHELL_HEIGHT = 'h-[calc(100dvh-140px)]';

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
  const { t } = useTranslation('payments');
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

  if (isLoading && !data.length) {
    return <PaymentsTableSkeleton />;
  }

  if (notFoundItems) {
    return (
      <div
        className={cn(
          'box-border flex w-full flex-col px-5 pb-5 sm:px-10 sm:pb-10',
          TABLE_SHELL_HEIGHT,
        )}
      >
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-hidden',
            'px-6 py-10 sm:gap-10 sm:px-8 sm:py-12',
          )}
        >
          <div className="flex max-w-md flex-col gap-2 text-center">
            <p className="text-l-base text-text-primary font-semibold">
              {isTutor ? t('empty.tutorTitle') : t('empty.studentTitle')}
            </p>
            <p className="text-s-base text-text-secondary dark:text-text-muted">
              {isTutor ? t('empty.tutorDescription') : t('empty.studentDescription')}
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
                  {t('empty.helpLink')}
                  <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
                </Button>
              </div>
            ) : null}
          </div>
          <div className="flex w-full shrink-0 justify-center px-2" aria-hidden>
            <EmptyPaymentsFull className="h-auto max-h-[200px] w-auto max-w-[240px] object-contain" />
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-[calc(100dvh-200px)] min-h-0 flex-1 overflow-auto pr-5">
        <div ref={parentRef}>
          <GridVirtualizer
            parentRef={parentRef}
            items={data}
            gap={12}
            isSingleColumn
            defaultRowHeight={100}
            renderItem={(item) => (
              <InvoiceCard
                payment={item}
                variant="table"
                currentUserRole={currentUserRole}
                onViewInvoice={onViewInvoice}
              />
            )}
          />

          <Loader isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
        </div>
      </div>
    );
  }

  const { rows } = table.getFilteredRowModel();

  return (
    <>
      <Table className="xs:rounded-tl-2xl table-fixed rounded-none px-2">
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

      <div className="h-[calc(100dvh-224px)] flex-1 overflow-auto">
        <div ref={parentRef}>
          <GridVirtualizer<Row<RolePaymentT<UserRoleT>>>
            parentRef={parentRef}
            items={rows}
            isSingleColumn
            defaultRowHeight={50}
            renderItem={(item) => (
              <Table className="table-fixed pr-5 pl-1">
                <TableBody>
                  <TableRow className="group hover:shadow-[0_0_0_1px_var(--xi-gray-30)]">
                    {item.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            )}
          />

          {/* Индикатор загрузки */}
          <Loader isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
        </div>
      </div>
    </>
  );
};
