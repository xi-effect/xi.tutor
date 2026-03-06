import { Tabs } from '@xipkg/tabs';
import React, { useMemo, useRef, useEffect } from 'react';
import { VirtualizedPaymentsTable } from './VirtualizedPaymentsTable';
import { useScreenSize } from 'common.utils';
import { createPaymentColumns, useInfiniteQuery } from 'features.table';
import { UserRoleT } from '../../../common.api/src/types';
import { TemplatesGrid } from './Templates';
import { useCurrentUser } from 'common.services';
import { PaymentApprovalFunctionT } from 'common.types';
// import { ChartsPage } from './Charts';

interface TabsComponentProps extends PaymentApprovalFunctionT {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabsComponent = React.memo(
  ({ onApprovePayment, activeTab, onTabChange }: TabsComponentProps) => {
    const screenSize = useScreenSize();
    const parentRef = useRef<HTMLDivElement>(null);

    const { data: user } = useCurrentUser();
    const isTutor = user?.default_layout === 'tutor';
    const currentUserRole = isTutor ? 'tutor' : 'student';
    const prevIsTutorRef = useRef(isTutor);

    const { items, isLoading, isFetchingNextPage, isError } = useInfiniteQuery(
      parentRef,
      currentUserRole,
    );

    const defaultColumns = useMemo(
      () =>
        createPaymentColumns<UserRoleT>({
          usersRole: isTutor ? 'student' : 'tutor',
          onApprovePayment,
          isTutor,
          screenSize,
        }),
      [screenSize, onApprovePayment, isTutor],
    );

    // Отслеживаем изменения роли пользователя
    useEffect(() => {
      const prevIsTutor = prevIsTutorRef.current;
      const currentIsTutor = isTutor;

      // Если роль изменилась с tutor на student и мы находимся на вкладке templates
      if (prevIsTutor && !currentIsTutor && activeTab === 'templates') {
        onTabChange('invoices');
      }

      // Обновляем предыдущее значение
      prevIsTutorRef.current = currentIsTutor;
    }, [isTutor, activeTab, onTabChange]);

    return (
      <div className="bg-gray-0 rounded-tl-2xl pl-4">
        <Tabs.Root value={activeTab} onValueChange={onTabChange}>
          <div className="h-full pt-0">
            <Tabs.Content value="invoices">
              <VirtualizedPaymentsTable
                data={items}
                columns={defaultColumns}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                parentRef={parentRef}
                isError={isError}
                currentUserRole={currentUserRole}
              />
            </Tabs.Content>

            {/* Скрываем контент последней вкладки для студентов */}
            {isTutor && (
              <Tabs.Content value="templates">
                <TemplatesGrid />
              </Tabs.Content>
            )}
          </div>
        </Tabs.Root>
      </div>
    );
  },
);
