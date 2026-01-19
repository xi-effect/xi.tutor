/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from 'react';
import { Tabs } from '@xipkg/tabs';
import { useSearch, useNavigate, useParams } from '@tanstack/react-router';
import { Plus } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Overview } from '../Overview';
import { SearchParams } from '../../types/router';
import { InformationLayout } from '../Information';
import { MaterialsAdd } from 'features.materials.add';
import { Payments } from '../Payments';
import { Materials } from '../Materials';
import { useGetClassroom } from 'common.services';
import { ModalStudentsGroup } from 'features.group.manage';
import { ModalGroupInvite } from 'features.group.invite';
import { InvoiceModal } from 'features.invoice';

export const TabsTutor = () => {
  const search: SearchParams = useSearch({ strict: false });
  const navigate = useNavigate();
  const currentTab = search.tab || 'overview';
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
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
      <div className="flex h-[56px] flex-row items-center gap-4 overflow-x-auto pr-4 pl-4 sm:pr-0">
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
            <Button size="s" variant="ghost" className="ml-auto rounded-lg">
              Добавить ученика
            </Button>
          </ModalStudentsGroup>
        )}
        {currentTab === 'overview' && classroom?.kind === 'group' && (
          <ModalGroupInvite>
            <Button size="s" variant="ghost" className="ml-1 rounded-lg">
              Пригласить в группу
            </Button>
          </ModalGroupInvite>
        )}
        {currentTab === 'materials' && <MaterialsAdd />}
        {currentTab === 'payments' && (
          <Button
            size="s"
            className="ml-auto w-8 rounded-lg px-2 py-2 font-medium sm:w-auto sm:px-4"
            onClick={() => setIsInvoiceModalOpen(true)}
          >
            <span className="hidden sm:flex">Создать счёт на оплату</span>
            <Plus size="sm" className="fill-brand-0 flex sm:hidden" />
          </Button>
        )}
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
      {isInvoiceModalOpen && (
        <InvoiceModal open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen} />
      )}
    </Tabs.Root>
  );
};
