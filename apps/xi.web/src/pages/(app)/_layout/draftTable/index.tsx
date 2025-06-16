import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';

import { useMedia } from 'common.utils';
import {
  DataTable,
  payments,
  students,
  subjects,
  PaymentT,
  createPaymentColumns,
} from 'features.table';

async function getData(): Promise<PaymentT[]> {
  return payments;
}

const DraftTable = () => {
  const [data, setData] = useState<PaymentT[]>([]);
  const isMobile = useMedia('(max-width: 700px)');

  useEffect(() => {
    getData().then(setData);
  }, []);

  const defaultColumns = useMemo(
    () => createPaymentColumns({ students, subjects, isMobile }),
    [isMobile],
  );

  return <DataTable data={data} columns={defaultColumns} />;
};

export const Route = createFileRoute('/(app)/_layout/draftTable/')({
  component: DraftTable,
  beforeLoad: ({ context, location }) => {
    console.log('DraftTable', context, location);
  },
});
