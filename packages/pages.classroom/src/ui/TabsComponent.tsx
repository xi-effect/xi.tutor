/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Tabs } from '@xipkg/tabs';
import { useSearch, useNavigate } from '@tanstack/react-router';

import { Button } from '@xipkg/button';
import { Overview } from './Overview';
import { SearchParams } from '../types/router';
import { Information } from './Information';
import { MaterialsAdd } from 'features.materials.add';
import { Payments } from './Payments';
import { Materials } from './Materials';
import { Calendar } from './Calendar';

export const TabsComponent = () => {
  const search: SearchParams = useSearch({ strict: false });
  const navigate = useNavigate();
  const currentTab = search.tab || 'overview';

  const handleTabChange = (value: string) => {
    navigate({
      // @ts-ignore
      search: { tab: value },
    });
  };

  return (
    <Tabs.Root value={currentTab} onValueChange={handleTabChange}>
      <div className="flex h-[56px] flex-row items-center overflow-x-auto pl-4">
        <Tabs.List className="flex flex-row gap-4">
          <Tabs.Trigger value="overview" className="text-m-base font-medium text-gray-100">
            Сводка
          </Tabs.Trigger>

          <Tabs.Trigger value="lessons" className="text-m-base font-medium text-gray-100">
            Занятия
          </Tabs.Trigger>

          <Tabs.Trigger value="materials" className="text-m-base font-medium text-gray-100">
            Материалы
          </Tabs.Trigger>

          <Tabs.Trigger value="payments" className="text-m-base font-medium text-gray-100">
            Оплаты
          </Tabs.Trigger>

          <Tabs.Trigger value="info" className="text-m-base font-medium text-gray-100">
            Информация
          </Tabs.Trigger>
        </Tabs.List>
        {(currentTab === 'overview' || currentTab === 'lessons') && (
          <Button size="s" className="ml-auto rounded-[8px]">
            Назначить занятие
          </Button>
        )}
        {currentTab === 'materials' && <MaterialsAdd />}
      </div>
      <div className="pt-0">
        <Tabs.Content value="overview">
          <Overview />
        </Tabs.Content>

        <Tabs.Content value="lessons">
          <Calendar />
        </Tabs.Content>

        <Tabs.Content value="materials">
          <Materials />
        </Tabs.Content>

        <Tabs.Content value="payments">
          <Payments />
        </Tabs.Content>

        <Tabs.Content value="info">
          <Information />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
};
