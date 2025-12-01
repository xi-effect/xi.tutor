import { useMemo, useRef, useState, useCallback } from 'react';
import { useInfiniteQuery, createPaymentColumns, RolePaymentT } from 'features.table';
import { VirtualizedPaymentsTable } from 'pages.payments';
import { useMediaQuery } from '@xipkg/utils';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom, useCurrentUser } from 'common.services';
import { PaymentApproveModal } from 'features.payment.approve';
import { UserRoleT } from 'common.api';

export const Payments = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom } = useGetClassroom(Number(classroomId));
  const isMobile = useMediaQuery('(max-width: 719px)');

  const [paymentApproveModalState, setPaymentApproveModalState] = useState<{
    isOpen: boolean;
    payment: RolePaymentT<UserRoleT> | null;
  }>({ isOpen: false, payment: null });

  const onOpenPaymentApproveModal = useCallback((payment: RolePaymentT<UserRoleT>) => {
    setPaymentApproveModalState({ isOpen: true, payment });
  }, []);

  const parentRef = useRef<HTMLDivElement>(null);

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const currentUserRole = isTutor ? 'tutor' : 'student';

  const { items, isLoading, isFetchingNextPage, isError } = useInfiniteQuery(
    parentRef,
    currentUserRole,
    classroomId,
  );

  const defaultColumns = useMemo(
    () =>
      createPaymentColumns({
        withStudentColumn: false,
        onApprovePayment: onOpenPaymentApproveModal,
        usersRole: isTutor ? 'student' : 'tutor',
        isMobile,
        isTutor,
      }),
    [isMobile, isTutor, onOpenPaymentApproveModal],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить платежи кабинета</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <VirtualizedPaymentsTable
        data={items}
        columns={defaultColumns}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        onApprovePayment={onOpenPaymentApproveModal}
        parentRef={parentRef}
        isError={isError}
        currentUserRole={currentUserRole}
      />

      {paymentApproveModalState.isOpen && paymentApproveModalState.payment && (
        <PaymentApproveModal
          open={paymentApproveModalState.isOpen}
          onOpenChange={(open) =>
            setPaymentApproveModalState({ ...paymentApproveModalState, isOpen: open })
          }
          paymentDetails={paymentApproveModalState.payment}
          recipientInvoiceId={paymentApproveModalState.payment.id}
        />
      )}
    </div>
  );
};
