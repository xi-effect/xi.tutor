import { Tabs } from '@xipkg/tabs';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { VirtualizedPaymentsTable } from './VirtualizedPaymentsTable';
import { useScreenSize } from 'common.utils';
import { createPaymentColumns, useInfiniteQuery } from 'features.table';
import { UserRoleT } from '../../../common.api/src/types';
import { TemplatesGrid } from './Templates';
import { useCurrentUser } from 'common.services';
import { PaymentApprovalFunctionT, RolePaymentT } from 'common.types';
import { PaymentsFilters } from './filters/PaymentsFilters';
import {
  emptyPaymentsFilters,
  hasPaymentsFilters,
  toInvoiceSearchFilters,
  type PaymentsFiltersState,
} from './filters/paymentsFilterState';

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
    const [filters, setFilters] = useState<PaymentsFiltersState>(emptyPaymentsFilters);
    const invoiceFilters = useMemo(() => toInvoiceSearchFilters(filters), [filters]);
    const filtersActive = hasPaymentsFilters(filters);

    const { items, isLoading, isFetchingNextPage, isError } = useInfiniteQuery(
      parentRef,
      currentUserRole,
      undefined,
      true,
      invoiceFilters,
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

      if (prevIsTutor !== currentIsTutor) {
        setFilters((current) =>
          current.counterpartyIds.length > 0 ? { ...current, counterpartyIds: [] } : current,
        );
      }

      prevIsTutorRef.current = currentIsTutor;
    }, [isTutor, activeTab, onTabChange]);

    return (
      <Tabs.Root
        className="flex h-full min-h-0 flex-col"
        value={activeTab}
        onValueChange={onTabChange}
      >
        <Tabs.Content
          value="invoices"
          className="flex min-h-0 flex-1 flex-col gap-4 outline-none data-[state=inactive]:hidden"
        >
          <PaymentsFilters isTutor={Boolean(isTutor)} value={filters} onChange={setFilters} />
          <VirtualizedPaymentsTable
            data={items}
            columns={defaultColumns}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            parentRef={parentRef}
            isError={isError}
            currentUserRole={currentUserRole}
            onViewInvoice={onViewInvoice}
            filtersActive={filtersActive}
            onResetFilters={() => setFilters(emptyPaymentsFilters())}
          />
        </Tabs.Content>

        {isTutor && (
          <Tabs.Content
            value="templates"
            className="flex min-h-0 flex-1 flex-col outline-none data-[state=inactive]:hidden"
          >
            <TemplatesGrid />
          </Tabs.Content>
        )}
      </Tabs.Root>
    );
  },
);
