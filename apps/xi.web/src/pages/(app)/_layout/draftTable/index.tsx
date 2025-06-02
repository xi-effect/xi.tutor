import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';
import { DataTable } from '../../../../../../../packages/features.table/index';
import {
  payments,
  students,
  subjects,
} from '../../../../../../../packages/features.table/src/mocks';
import { PaymentT } from '../../../../../../../packages/features.table/src/types';
import { createPaymentColumns } from '../../../../../../../packages/features.table/src/ui/defaultColumns';
import { useIsMobile } from '../../../../../../../packages/features.table/src/utils/useIsMobile';

async function getData(): Promise<PaymentT[]> {
  return payments;
}

const DraftTable = () => {
  const [data, setData] = useState<PaymentT[]>([]);
  const isMobile = useIsMobile(700);

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
