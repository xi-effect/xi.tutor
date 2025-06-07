import { Tabs } from '@xipkg/tabs';
import { useEffect, useMemo, useState } from 'react';
import { PaymentsTable } from './PaymentsTable';
import { useMedia } from 'common.utils';
import { students, subjects, PaymentT, createPaymentColumns, payments } from 'features.table';

async function getData(): Promise<PaymentT[]> {
  return payments;
}

export const TabsComponent = () => {
  const [data, setData] = useState<PaymentT[]>([]);
  const isMobile = useMedia('(max-width: 700px)');

  useEffect(() => {
    getData().then(setData);
  }, []);

  const defaultColumns = useMemo(
    () => createPaymentColumns({ students, subjects, isMobile }),
    [isMobile],
  );

  return (
    <Tabs.Root defaultValue="boards">
      <Tabs.List className="flex w-70 flex-row gap-4">
        <Tabs.Trigger value="boards" className="text-m-base font-medium text-gray-100">
          Журнал оплат
        </Tabs.Trigger>

        <Tabs.Trigger value="notes" className="text-m-base font-medium text-gray-100">
          Аналитика
        </Tabs.Trigger>
      </Tabs.List>

      <div className="pt-0">
        <Tabs.Content value="boards">
          <PaymentsTable
            data={data}
            columns={defaultColumns}
            students={students}
            subjects={subjects}
          />
        </Tabs.Content>

        <Tabs.Content value="notes">Заметки</Tabs.Content>
      </div>
    </Tabs.Root>
  );
};
