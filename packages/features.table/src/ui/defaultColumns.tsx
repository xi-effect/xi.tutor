import { ColumnDef } from '@tanstack/react-table';

import { PaymentT, StudentT, SubjectT } from '../types';

import {
  DateCell,
  StudentCell,
  SubjectCell,
  AmountPaymentCell,
  TypePaymentCell,
  StatusCell,
  ConfirmPayment,
} from './cells';

export function createPaymentColumns(
  students: StudentT[],
  subjects: SubjectT[],
): ColumnDef<PaymentT>[] {
  return [
    {
      accessorKey: 'date',
      header: 'Дата',
      cell: ({ row }) => <DateCell date={row.original.datePayment} />,
    },
    {
      accessorKey: 'student',
      header: 'Студент',
      cell: ({ row }) => {
        const student = students.find((user) => user.id === row.original.idStudent);

        if (!student) {
          console.error(`Студент с id ${row.original.idStudent} не найден`);
          return null;
        }

        return (
          <StudentCell
            id={student?.id}
            name={student?.name ?? ''}
            description={student?.description ?? ''}
            avatarUrl={student?.avatarUrl}
          />
        );
      },
    },
    {
      accessorKey: 'subject',
      header: 'Предмет',
      cell: ({ row }) => {
        const subject = subjects.find((s) => s.id === row.original.idSubject);
        return <SubjectCell subject={subject?.name ?? ''} />;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Сумма',
      cell: ({ row }) => <AmountPaymentCell amount={row.original.amountPayment} />,
    },
    {
      accessorKey: 'paymentType',
      header: 'Тип оплаты',
      cell: ({ row }) => <TypePaymentCell typePayment={row.original.typePayment} />,
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => <StatusCell status={row.original.statusPayment} />,
    },
    {
      accessorKey: 'confirmPayment',
      header: '',
      cell: ({ row }) => <ConfirmPayment status={row.original.statusPayment} />,
    },
  ];
}
