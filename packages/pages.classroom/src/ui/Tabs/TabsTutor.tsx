/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Tabs } from '@xipkg/tabs';
import { useSearch, useNavigate, useParams } from '@tanstack/react-router';

import { Button } from '@xipkg/button';
import { Overview } from '../Overview';
import { SearchParams } from '../../types/router';
import { InformationLayout } from '../Information';
import { MaterialsAdd } from 'features.materials.add';
import { Payments } from '../Payments';
import { Materials } from '../Materials';
import { useGetClassroom } from 'common.services';
import { ModalStudentsGroup } from 'features.group.manage';

export const TabsTutor = () => {
  const search: SearchParams = useSearch({ strict: false });
  const navigate = useNavigate();
  const currentTab = search.tab || 'overview';

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom } = useGetClassroom(Number(classroomId));

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
        {currentTab === 'overview' && classroom?.kind === 'group' && (
          <ModalStudentsGroup>
            <Button size="s" variant="ghost" className="ml-auto rounded-[8px]">
              Добавить ученика
            </Button>
          </ModalStudentsGroup>
        )}
        {currentTab === 'materials' && <MaterialsAdd />}
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

        <Tabs.Content value="info">
          <InformationLayout />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
};
