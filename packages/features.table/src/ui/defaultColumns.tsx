import { ColumnDef } from '@tanstack/react-table';
import { PaymentT, StudentT, SubjectT } from '../types';
import {
  DateCell,
  StudentCell,
  SubjectCell,
  AmountPaymentCell,
  TypePaymentCell,
  StatusCell,
} from './cells';

type ColumnArgsT = {
  students: StudentT[];
  subjects: SubjectT[];
  isMobile?: boolean;
};

export const createPaymentColumns = ({
  students,
  subjects,
  isMobile,
}: ColumnArgsT): ColumnDef<PaymentT>[] => {
  const columns: (ColumnDef<PaymentT> | false)[] = [
    {
      accessorKey: 'datePayment',
      header: 'Дата',
      cell: ({ row }) => <DateCell date={row.original.datePayment} />,
      filterFn: (row, columnId, value) => {
        const date = new Date(row.getValue(columnId)).getTime();
        const [from, to] = value;
        return (
          (!from || date >= new Date(from).getTime()) && (!to || date <= new Date(to).getTime())
        );
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'idStudent',
      header: 'Студент',
      cell: ({ row }) => {
        const student = students.find((s) => s.id === row.original.idStudent);
        return student ? <StudentCell {...student} /> : null;
      },
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: true,
    },
    !isMobile && {
      accessorKey: 'idSubject',
      header: 'Предмет',
      cell: ({ row }) => {
        const subject = subjects.find((s) => s.id === row.original.idSubject);
        return <SubjectCell subject={subject?.name ?? ''} />;
      },
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'amountPayment',
      header: 'Сумма',
      cell: ({ row }) => <AmountPaymentCell amount={row.original.amountPayment} />,
      filterFn: (row, columnId, value) => {
        const amount = row.getValue(columnId) as number;
        const [min, max] = value as [string, string];
        return (!min || amount >= +min) && (!max || amount <= +max);
      },
      enableColumnFilter: true,
    },
    !isMobile && {
      accessorKey: 'typePayment',
      header: 'Тип оплаты',
      cell: ({ row }) => <TypePaymentCell typePayment={row.original.typePayment} />,
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'statusPayment',
      header: 'Статус',
      cell: ({ row }) => <StatusCell status={row.original.statusPayment} />,
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableColumnFilter: true,
    },
  ];

  return columns.filter((col): col is ColumnDef<PaymentT> => Boolean(col));
};
