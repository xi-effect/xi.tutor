/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Tabs } from '@xipkg/tabs';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { Button } from '@xipkg/button';
import { Overview } from './Overview';
import { SearchParams } from '../types/router';
import { InformationLayout } from './Information';
import { MaterialsAdd } from 'features.materials.add';
import { Payments } from './Payments';
import { Materials } from './Materials';
// import { Calendar } from './Calendar';
import { useCurrentUser } from 'common.services';
import { ModalStudentsGroup } from 'features.group.manage';

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

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const prevIsTutorRef = useRef(isTutor);

  // Отслеживаем изменения роли пользователя
  useEffect(() => {
    const prevIsTutor = prevIsTutorRef.current;
    const currentIsTutor = isTutor;

    // Если роль изменилась с tutor на student и мы находимся на вкладке info
    if (prevIsTutor && !currentIsTutor && currentTab === 'info') {
      navigate({
        // @ts-ignore
        search: { tab: 'overview' },
      });
    }

    // Обновляем предыдущее значение
    prevIsTutorRef.current = currentIsTutor;
  }, [isTutor, currentTab, navigate]);

  return (
    <Tabs.Root value={currentTab} onValueChange={handleTabChange}>
      <div className="flex h-[56px] flex-row items-center overflow-x-auto pl-4">
        <Tabs.List className="flex flex-row gap-4">
          <Tabs.Trigger value="overview" className="text-m-base font-medium text-gray-100">
            Сводка
          </Tabs.Trigger>

          {/* <Tabs.Trigger value="lessons" className="text-m-base font-medium text-gray-100">
            Занятия
          </Tabs.Trigger> */}

          <Tabs.Trigger value="materials" className="text-m-base font-medium text-gray-100">
            Материалы
          </Tabs.Trigger>

          <Tabs.Trigger value="payments" className="text-m-base font-medium text-gray-100">
            Оплаты
          </Tabs.Trigger>

          {isTutor && (
            <Tabs.Trigger value="info" className="text-m-base font-medium text-gray-100">
              Информация
            </Tabs.Trigger>
          )}
        </Tabs.List>
        {/* {(currentTab === 'overview' || currentTab === 'lessons') && (
          <Button size="s" className="ml-auto rounded-[8px]">
            Назначить занятие
          </Button>
        )} */}
        {currentTab === 'overview' && isTutor && (
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

        {/* <Tabs.Content value="lessons">
          <Calendar />
        </Tabs.Content> */}

        <Tabs.Content value="materials">
          <Materials />
        </Tabs.Content>

        <Tabs.Content value="payments">
          <Payments />
        </Tabs.Content>

        {isTutor && (
          <Tabs.Content value="info">
            <InformationLayout />
          </Tabs.Content>
        )}
      </div>
    </Tabs.Root>
  );
};
