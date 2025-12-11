/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Tabs } from '@xipkg/tabs';
import { useSearch, useNavigate } from '@tanstack/react-router';

import { Overview } from '../Overview';
import { SearchParams } from '../../types/router';
import { Payments } from '../Payments';
import { Materials } from '../Materials';

export const TabsStudent = () => {
  const search: SearchParams = useSearch({ strict: false });
  const navigate = useNavigate();
  const currentTab = search.tab || 'overview';

  const handleTabChange = (value: string) => {
    // Сохраняем параметр call при смене табов
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      // @ts-ignore
      search: {
        // @ts-ignore
        tab: value,
        ...filteredSearch,
      },
    });
  };

  return (
    <Tabs.Root value={currentTab} onValueChange={handleTabChange}>
      <div className="flex h-[56px] flex-row items-center overflow-x-auto pl-4">
        <Tabs.List className="flex flex-row gap-4">
          <Tabs.Trigger value="overview" className="text-m-base font-medium text-gray-100">
            Сводка
          </Tabs.Trigger>

          <Tabs.Trigger
            value="materials"
            className="text-m-base font-medium text-gray-100"
            id="materials-tab"
          >
            Материалы
          </Tabs.Trigger>

          <Tabs.Trigger
            value="payments"
            className="text-m-base font-medium text-gray-100"
            id="payments-tab"
          >
            Оплаты
          </Tabs.Trigger>
        </Tabs.List>
      </div>
      <div className="pt-0">
        <Tabs.Content value="overview">
          <Overview />
        </Tabs.Content>

        <Tabs.Content value="materials">
          <Materials />
        </Tabs.Content>

        <Tabs.Content value="payments">
          <Payments />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
};
