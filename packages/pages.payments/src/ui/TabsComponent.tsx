import { Tabs } from '@xipkg/tabs';
import { useMemo, useRef } from 'react';
import { VirtualizedPaymentsTable } from './VirtualizedPaymentsTable';
import { useMedia } from 'common.utils';
import { students, subjects, createPaymentColumns, PaymentT } from 'features.table';
import { PaymentControl as PaymentsCharts } from 'features.charts';
import { useInfiniteQuery } from '../hooks';

type TabsComponentPropsT = {
  onApprovePayment: (payment: PaymentT) => void;
};

export const TabsComponent = ({ onApprovePayment }: TabsComponentPropsT) => {
  const isMobile = useMedia('(max-width: 700px)');
  const parentRef = useRef<HTMLDivElement>(null);

  const { items, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(parentRef);

  const defaultColumns = useMemo(
    () =>
      createPaymentColumns({
        withStudentColumn: true,
        students,
        subjects,
        isMobile,
        onApprovePayment,
      }),
    [isMobile, onApprovePayment],
  );

  return (
    <Tabs.Root defaultValue="boards">
      <Tabs.List className="flex w-70 flex-row gap-4">
        <Tabs.Trigger value="boards" className="text-m-base font-medium text-gray-100">
          Журнал оплат
        </Tabs.Trigger>

        <Tabs.Trigger value="charts" className="text-m-base font-medium text-gray-100">
          Аналитика
        </Tabs.Trigger>
      </Tabs.List>

      <div className="h-full pt-0">
        <Tabs.Content value="boards">
          <VirtualizedPaymentsTable
            data={items}
            columns={defaultColumns}
            students={students}
            subjects={subjects}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onLoadMore={fetchNextPage}
            onApprovePayment={onApprovePayment}
          />
        </Tabs.Content>

        <Tabs.Content value="charts">
          <PaymentsCharts />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
};
