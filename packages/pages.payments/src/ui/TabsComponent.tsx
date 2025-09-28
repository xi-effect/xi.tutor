import { Tabs } from '@xipkg/tabs';
import { useMemo, useRef, useEffect } from 'react';
import { VirtualizedPaymentsTable } from './VirtualizedPaymentsTable';
import { useMedia } from 'common.utils';
import { students, subjects, createPaymentColumns, PaymentT } from 'features.table';
import { TemplatesGrid } from './Templates';
import { useInfiniteQuery } from '../hooks';
import { useCurrentUser } from 'common.services';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { ChartsPage } from './Charts';

type TabsComponentPropsT = {
  onApprovePayment: (payment: PaymentT) => void;
};

export const TabsComponent = ({ onApprovePayment }: TabsComponentPropsT) => {
  const isMobile = useMedia('(max-width: 700px)');
  const parentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const currentTab = search.tab || 'boards';

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const prevIsTutorRef = useRef(isTutor);

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

  // Отслеживаем изменения роли пользователя
  useEffect(() => {
    const prevIsTutor = prevIsTutorRef.current;
    const currentIsTutor = isTutor;

    // Если роль изменилась с tutor на student и мы находимся на вкладке templates
    if (prevIsTutor && !currentIsTutor && currentTab === 'templates') {
      navigate({
        // @ts-expect-error - TanStack Router search params typing issue
        search: { tab: 'boards' },
      });
    }

    // Обновляем предыдущее значение
    prevIsTutorRef.current = currentIsTutor;
  }, [isTutor, currentTab, navigate]);

  const handleTabChange = (value: string) => {
    navigate({
      // @ts-expect-error - TanStack Router search params typing issue
      search: { tab: value },
    });
  };

  return (
    <Tabs.Root value={currentTab} onValueChange={handleTabChange}>
      <Tabs.List className="flex w-80 flex-row gap-4">
        <Tabs.Trigger value="boards" className="text-m-base font-medium text-gray-100">
          Журнал оплат
        </Tabs.Trigger>

        <Tabs.Trigger value="charts" className="text-m-base font-medium text-gray-100">
          Аналитика
        </Tabs.Trigger>

        {/* Скрываем последнюю вкладку для студентов */}
        {isTutor && (
          <Tabs.Trigger value="templates" className="text-m-base font-medium text-gray-100">
            Типы оплат
          </Tabs.Trigger>
        )}
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
          <ChartsPage />
        </Tabs.Content>

        {/* Скрываем контент последней вкладки для студентов */}
        {isTutor && (
          <Tabs.Content value="templates">
            <TemplatesGrid />
          </Tabs.Content>
        )}
      </div>
    </Tabs.Root>
  );
};
