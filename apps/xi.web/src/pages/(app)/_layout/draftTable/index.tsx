/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { Table } from '../../../../../../../packages/features.table/index';

const DraftTable = () => {
  return <Table />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/draftTable/')({
  component: DraftTable,
  beforeLoad: ({ context, location }) => {
    console.log('DraftTable', context, location);
  },
});
