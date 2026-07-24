import { Tabs } from '@xipkg/tabs';
import React, { useMemo, useRef, useEffect } from 'react';
import { VirtualizedPaymentsTable } from './VirtualizedPaymentsTable';
import { useScreenSize } from 'common.utils';
import { createPaymentColumns, useInfiniteQuery } from 'features.table';
import { UserRoleT } from '../../../common.api/src/types';
import { TemplatesGrid } from './Templates';
import { useCurrentUser } from 'common.services';
import { PaymentApprovalFunctionT, RolePaymentT } from 'common.types';

interface TabsComponentProps extends PaymentApprovalFunctionT {
  onViewInvoice: (payment: RolePaymentT<UserRoleT>) => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabsComponent = React.memo(
  ({ onApprovePayment, onViewInvoice, activeTab, onTabChange }: TabsComponentProps) => {
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
          onViewInvoice,
          isTutor,
          screenSize,
        }),
      [screenSize, onApprovePayment, onViewInvoice, isTutor],
    );

    useEffect(() => {
      const prevIsTutor = prevIsTutorRef.current;
      const currentIsTutor = isTutor;
      if (prevIsTutor && !currentIsTutor && activeTab === 'templates') {
        onTabChange('invoices');
      }

      prevIsTutorRef.current = currentIsTutor;
    }, [isTutor, activeTab, onTabChange]);

    return (
      <div className="h-full min-h-0">
        <Tabs.Root
          value={activeTab}
          onValueChange={onTabChange}
          className="flex h-full min-h-0 flex-col"
        >
          <Tabs.Content value="invoices" className="min-h-0 flex-1">
            <VirtualizedPaymentsTable
              data={items}
              columns={defaultColumns}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              parentRef={parentRef}
              isError={isError}
              currentUserRole={currentUserRole}
              onViewInvoice={onViewInvoice}
            />
          </Tabs.Content>

          {isTutor && (
            <Tabs.Content value="templates" className="min-h-0 flex-1">
              <TemplatesGrid />
            </Tabs.Content>
          )}
        </Tabs.Root>
      </div>
    );
  },
);
