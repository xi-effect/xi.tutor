import { Column, Table as TableType } from '@tanstack/react-table';

import {
  DateRangeFilter,
  AmountRangeFilter,
  StudentFilter,
  SubjectFilter,
  CheckboxFilter,
} from '../filters';

import {
  FilterColumnId,
  PaymentStatusT,
  mapPaymentStatus,
  PaymentTypeT,
  mapPaymentType,
} from '../types';

export const getFilterComponentMap = <TData,>(
  column: Column<TData, unknown>,
  table: TableType<TData>,
): Partial<Record<FilterColumnId, () => React.ReactNode | null>> => ({
  datePayment: () => <DateRangeFilter column={column} />,
  amountPayment: () => <AmountRangeFilter column={column} />,
  idStudent: () => <StudentFilter table={table} students={table.options.meta?.students || []} />,
  idSubject: () => <SubjectFilter column={column} subjects={table.options.meta?.subjects || []} />,
  statusPayment: () => (
    <CheckboxFilter
      column={column}
      options={Object.entries(mapPaymentStatus).map(([value, label]) => ({
        value: value as PaymentStatusT,
        label,
      }))}
    />
  ),
  typePayment: () => (
    <CheckboxFilter
      column={column}
      options={Object.entries(mapPaymentType).map(([value, label]) => ({
        value: value as PaymentTypeT,
        label,
      }))}
    />
  ),
});
