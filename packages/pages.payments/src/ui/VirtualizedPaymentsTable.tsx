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
import { cn, useMediaQuery } from '@xipkg/utils';
import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EmptyPaymentsFull,
  PageEmptyState,
  pageEmptyActionButtonClass,
  pageEmptyIllustrationClass,
} from 'common.ui';
import { Loader } from './Loader';
import { PaymentsTableSkeleton } from './PaymentsTableSkeleton';
import { UserRoleT } from '../../../common.api/src/types';
import { RolePaymentT as CommonRolePaymentT } from 'common.types';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { InvoiceCard } from 'features.invoice.card';

/** База знаний — как в блоке «Оплата» на главной */
const PAYMENTS_HELP_URL = 'https://support.sovlium.ru/payments';

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
  const isMobile = useMediaQuery('(max-width: 960px)');

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
    return <PaymentsTableSkeleton isMobile={isMobile} />;
  }

  if (notFoundItems) {
    return (
      <PageEmptyState
        title={isTutor ? t('empty.tutorTitle') : t('empty.studentTitle')}
        description={isTutor ? t('empty.tutorDescription') : t('empty.studentDescription')}
        actions={
          isTutor ? (
            <Button
              type="button"
              variant="none"
              className={pageEmptyActionButtonClass}
              onClick={() => window.open(PAYMENTS_HELP_URL, '_blank', 'noopener,noreferrer')}
              data-umami-event="payments-page-empty-help"
            >
              {t('empty.helpLink')}
              <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
            </Button>
          ) : undefined
        }
        illustration={<EmptyPaymentsFull className={pageEmptyIllustrationClass} />}
      />
    );
  }

  if (isMobile) {
    return (
      <div
        ref={parentRef}
        className={cn('h-full min-h-0 flex-1 overflow-auto', isTutor && 'pb-20')}
      >
        <GridVirtualizer
          parentRef={parentRef}
          items={data}
          gap={20}
          isSingleColumn
          defaultRowHeight={160}
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
    );
  }

  const { rows } = table.getFilteredRowModel();

  return (
    <>
      {/* px-1 компенсирует разницу, чтобы названия столбцов выровнялись с контентом в строках */}
      <Table className="xs:rounded-tl-2xl table-fixed rounded-none px-1">
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
      <div ref={parentRef} className="h-full min-h-0 flex-1 overflow-auto px-1">
        {/* px-1 не дает обрезаться бордеру слева и справа у строки в таблице */}
        <GridVirtualizer<Row<RolePaymentT<UserRoleT>>>
          parentRef={parentRef}
          items={rows}
          isSingleColumn
          defaultRowHeight={50}
          renderItem={(item) => (
            <Table className="table-fixed">
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
        <Loader isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
      </div>
    </>
  );
};
