import { ColumnDef } from '@tanstack/react-table';
import { RolePaymentT, RoleT, StudentPaymentT, TutorPaymentT } from '../types';
import {
  DateCell,
  UserCell,
  // SubjectCell,
  AmountPaymentCell,
  TypePaymentCell,
  StatusCell,
  ActionsCell,
} from '../ui/cells';

type ColumnArgsT = {
  usersRole: RoleT;
  isMobile?: boolean;
  onApprovePayment?: (payment: RolePaymentT) => void;
  withStudentColumn?: boolean;
};

export const createPaymentColumns = ({
  usersRole,
  onApprovePayment,
}: ColumnArgsT): ColumnDef<RolePaymentT>[] => {
  const baseColumns: (ColumnDef<RolePaymentT> | false)[] = [
    {
      accessorKey: 'created_at',
      header: 'Дата',
      cell: ({ row }) => <DateCell date={row.original.created_at} />,
      size: 82,
      filterFn: (row, columnId, value) => {
        const date = new Date(row.getValue(columnId)).getTime();
        const [from, to] = value;
        return (
          (!from || date >= new Date(from).getTime()) && (!to || date <= new Date(to).getTime())
        );
      },
      enableColumnFilter: true,
    },
  ];

  const RoleColumn: ColumnDef<RolePaymentT> | false = {
    accessorKey: usersRole === 'student' ? 'student_id' : 'tutor_id',
    header: usersRole === 'student' ? 'Ученик' : 'Репетитор',
    cell: ({ row }) => {
      const original = row.original as StudentPaymentT | TutorPaymentT;
      return (
        <UserCell
          userId={
            usersRole === 'student'
              ? (original as StudentPaymentT).student_id
              : (original as TutorPaymentT).tutor_id
          }
          userRole={usersRole}
        />
      );
    },
    size: 160,
    filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
    enableColumnFilter: true,
  };

  const columns: (ColumnDef<RolePaymentT> | false)[] = [
    ...baseColumns,
    RoleColumn,
    // {
    //   accessorKey: 'idSubject',
    //   header: 'Предмет',
    //   cell: ({ row }) => {
    //     const subject = subjects.find((s) => s.id === row.original.idSubject);
    //     return <SubjectCell subject={subject?.name ?? ''} />;
    //   },
    //   size: 150,
    //   filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
    //   enableColumnFilter: true,
    // },
    {
      accessorKey: 'total',
      header: 'Сумма',
      cell: ({ row }) => <AmountPaymentCell total={row.original.total} />,
      size: 100,
      filterFn: (row, columnId, value) => {
        const amount = row.getValue(columnId) as number;
        const [min, max] = value as [string, string];
        return (!min || amount >= +min) && (!max || amount <= +max);
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'payment_type',
      header: 'Тип оплаты',
      cell: ({ row }) => <TypePaymentCell paymentType={row.original.payment_type} />,
      size: 100,
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => (
        <StatusCell
          status={row.original.status}
          onApprovePayment={() => onApprovePayment?.(row.original)}
        />
      ),
      size: 220,
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: () => (usersRole === 'student' ? <ActionsCell /> : null),
      size: usersRole === 'student' ? 96 : 0,
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: false,
    },
  ];

  return columns.filter((col): col is ColumnDef<RolePaymentT> => Boolean(col));
};
