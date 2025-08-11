import { useEffect, useMemo, useState } from 'react';
import { students, subjects, PaymentT, createPaymentColumns, payments } from 'features.table';
import { PaymentsTable } from 'pages.payments';
import { useMediaQuery } from '@xipkg/utils';

async function getData(): Promise<PaymentT[]> {
  return payments;
}

export const Payments = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  const [data, setData] = useState<PaymentT[]>([]);

  useEffect(() => {
    getData().then(setData);
  }, []);

  const defaultColumns = useMemo(
    () => createPaymentColumns({ withStudentColumn: false, students, subjects, isMobile }),
    [isMobile],
  );

  return (
    <div className="flex flex-col">
      <PaymentsTable data={data} columns={defaultColumns} students={students} subjects={subjects} />
    </div>
  );
};
