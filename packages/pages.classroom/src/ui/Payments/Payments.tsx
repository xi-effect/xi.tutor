import { useEffect, useMemo, useState } from 'react';
import { students, subjects, PaymentT, createPaymentColumns, payments } from 'features.table';
import { PaymentsTable } from 'pages.payments';
import { useMediaQuery } from '@xipkg/utils';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom } from 'common.services';

async function getData(): Promise<PaymentT[]> {
  return payments;
}

export const Payments = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));
  const isMobile = useMediaQuery('(max-width: 719px)');

  const [data, setData] = useState<PaymentT[]>([]);

  useEffect(() => {
    getData().then(setData);
  }, []);

  const defaultColumns = useMemo(
    () => createPaymentColumns({ withStudentColumn: false, students, subjects, isMobile }),
    [isMobile],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить платежи кабинета</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PaymentsTable data={data} columns={defaultColumns} students={students} subjects={subjects} />
    </div>
  );
};
