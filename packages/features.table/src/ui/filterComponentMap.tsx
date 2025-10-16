import { Column, Table as TableType } from '@tanstack/react-table';

import {
  DateRangeFilter,
  AmountRangeFilter,
  StudentFilter,
  // SubjectFilter,
  CheckboxFilter,
} from '../filters';

import {
  FilterColumnId,
  PaymentStatusT,
  mapPaymentStatus,
  RolePaymentT,
  mapPaymentType,
  RoleT,
} from '../types';

export const getFilterComponentMap = <TData,>(
  column: Column<TData, unknown>,
  table: TableType<TData>,
  usersRole?: RoleT,
): Partial<Record<FilterColumnId, () => React.ReactNode | null>> => ({
  created_at: () => <DateRangeFilter column={column} />,
  total: () => <AmountRangeFilter column={column} />,
  ...(usersRole === 'student' && {
    student_id: () => <StudentFilter table={table} students={table.options.meta?.students || []} />,
  }),
  // idSubject: () => <SubjectFilter column={column} subjects={table.options.meta?.subjects || []} />,
  status: () => (
    <CheckboxFilter
      column={column}
      options={Object.entries(mapPaymentStatus).map(([value, label]) => ({
        value: value as PaymentStatusT,
        label,
      }))}
    />
  ),
  payment_type: () => (
    <CheckboxFilter
      column={column}
      options={Object.entries(mapPaymentType).map(([value, label]) => ({
        value: value as RolePaymentT['payment_type'],
        label,
      }))}
    />
  ),
});
