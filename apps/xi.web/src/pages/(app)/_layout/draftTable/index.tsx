/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

import { DataTable } from '../../../../../../../packages/features.table/index';
import {
  payments,
  students,
  subjects,
} from '../../../../../../../packages/features.table/src/mocks';
import { PaymentT } from '../../../../../../../packages/features.table/src/types';
import { createPaymentColumns } from '../../../../../../../packages/features.table/src/ui/defaultColumns';

async function getData(): Promise<PaymentT[]> {
  return payments;
}

const DraftTable = async () => {
  const data = await getData();

  const defaultColumns = createPaymentColumns(students, subjects);

  return <DataTable data={data} columns={defaultColumns} />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/draftTable/')({
  component: DraftTable,
  beforeLoad: ({ context, location }) => {
    console.log('DraftTable', context, location);
  },
});
