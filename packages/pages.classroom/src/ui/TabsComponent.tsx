import { Tabs } from '@xipkg/tabs';

import { Button } from '@xipkg/button';
import { Overview } from './Overview';

export const TabsComponent = () => {
  return (
    <Tabs.Root defaultValue="overview">
      <div className="flex flex-row items-center pl-4">
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
        <Button size="s" className="ml-auto rounded-[8px]">
          Назначить занятие
        </Button>
      </div>
      <div className="pt-6">
        <Tabs.Content value="overview">
          <Overview />
        </Tabs.Content>

        <Tabs.Content value="lessons">Занятия</Tabs.Content>

        <Tabs.Content value="materials">Материалы</Tabs.Content>

        <Tabs.Content value="payments">Оплаты</Tabs.Content>

        <Tabs.Content value="info">Информация</Tabs.Content>
      </div>
    </Tabs.Root>
  );
};
