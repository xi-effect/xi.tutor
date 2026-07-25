import { useCallback, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, createPaymentColumns } from 'features.table';
import { PaymentInvoiceDetailsModal, VirtualizedPaymentsTable } from 'pages.payments';
import { useScreenSize } from 'common.utils';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom, useCurrentUser } from 'common.services';
import { useTranslation } from 'react-i18next';
import { LoadingState } from './LoadingState';
import { RolePaymentT } from 'common.types';
import { UserRoleT } from 'common.api';

export const Payments = () => {
  const { t } = useTranslation('classroom');
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom } = useGetClassroom(Number(classroomId));
  const screenSize = useScreenSize();
  const [invoiceDetailsModalState, setInvoiceDetailsModalState] = useState<{
    isOpen: boolean;
    payment: RolePaymentT<'tutor'> | RolePaymentT<'student'> | null;
  }>({ isOpen: false, payment: null });

  const parentRef = useRef<HTMLDivElement>(null);

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const currentUserRole = isTutor ? 'tutor' : 'student';

  const { items, isLoading, isFetchingNextPage, isError } = useInfiniteQuery(
    parentRef,
    currentUserRole,
    classroomId,
  );

  const onOpenInvoiceDetailsModal = useCallback((payment: RolePaymentT<UserRoleT>) => {
    setInvoiceDetailsModalState({ isOpen: true, payment });
  }, []);

  const defaultColumns = useMemo(
    () =>
      createPaymentColumns({
        withStudentColumn: false,
        usersRole: isTutor ? 'student' : 'tutor',
        screenSize,
        isTutor,
        onViewInvoice: onOpenInvoiceDetailsModal,
      }),
    [screenSize, isTutor, onOpenInvoiceDetailsModal],
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-text-primary text-xl font-medium">{t('errors.loadData')}</h2>
        <p className="text-text-primary">{t('errors.classroomPayments')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-sm:pl-4">
      {invoiceDetailsModalState.isOpen && invoiceDetailsModalState.payment && (
        <PaymentInvoiceDetailsModal
          open={invoiceDetailsModalState.isOpen}
          onOpenChange={(open) =>
            setInvoiceDetailsModalState((prev) => ({
              ...prev,
              isOpen: open,
            }))
          }
          paymentDetails={invoiceDetailsModalState.payment}
          recipientInvoiceId={invoiceDetailsModalState.payment.id}
          currentUserRole={currentUserRole}
        />
      )}
      <VirtualizedPaymentsTable
        className="h-[calc(100dvh-252px)]"
        data={items}
        columns={defaultColumns}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        parentRef={parentRef}
        isError={isError}
        currentUserRole={currentUserRole}
        onViewInvoice={onOpenInvoiceDetailsModal}
      />
    </div>
  );
};
