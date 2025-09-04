import { ColumnDef } from '@tanstack/react-table';
import { PaymentT, StudentT, SubjectT } from '../types';
import {
  DateCell,
  StudentCell,
  SubjectCell,
  AmountPaymentCell,
  TypePaymentCell,
  StatusCell,
  ActionsCell,
} from './cells';

type ColumnArgsT = {
  students: StudentT[];
  subjects: SubjectT[];
  withStudentColumn?: boolean;
  isMobile?: boolean;
  onApprovePayment?: (payment: PaymentT) => void;
};

export const createPaymentColumns = ({
  students,
  subjects,
  withStudentColumn = true,
  onApprovePayment,
  // isMobile,
}: ColumnArgsT): ColumnDef<PaymentT>[] => {
  const baseColumns: (ColumnDef<PaymentT> | false)[] = [
    {
      accessorKey: 'datePayment',
      header: 'Дата',
      cell: ({ row }) => <DateCell date={row.original.datePayment} />,
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

  const studentColumn: ColumnDef<PaymentT> | false = withStudentColumn
    ? {
        accessorKey: 'idStudent',
        header: 'Ученик',
        cell: ({ row }) => {
          const student = students.find((s) => s.id === row.original.idStudent);
          return student ? <StudentCell {...student} /> : null;
        },
        size: 160,
        filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
        enableColumnFilter: true,
      }
    : false;

  const columns: (ColumnDef<PaymentT> | false)[] = [
    ...baseColumns,
    studentColumn,
    {
      accessorKey: 'idSubject',
      header: 'Предмет',
      cell: ({ row }) => {
        const subject = subjects.find((s) => s.id === row.original.idSubject);
        return <SubjectCell subject={subject?.name ?? ''} />;
      },
      size: 150,
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'amountPayment',
      header: 'Сумма',
      cell: ({ row }) => <AmountPaymentCell amount={row.original.amountPayment} />,
      size: 100,
      filterFn: (row, columnId, value) => {
        const amount = row.getValue(columnId) as number;
        const [min, max] = value as [string, string];
        return (!min || amount >= +min) && (!max || amount <= +max);
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'typePayment',
      header: 'Тип оплаты',
      cell: ({ row }) => <TypePaymentCell typePayment={row.original.typePayment} />,
      size: 100,
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'statusPayment',
      header: 'Статус',
      cell: ({ row }) => (
        <StatusCell
          status={row.original.statusPayment}
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
      cell: () => <ActionsCell />,
      size: 96,
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: false,
    },
  ];

  return columns.filter((col): col is ColumnDef<PaymentT> => Boolean(col));
};
