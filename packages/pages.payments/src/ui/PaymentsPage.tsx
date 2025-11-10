import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { InvoiceModal } from 'features.invoice';
import { PaymentApproveModal } from 'features.payment.approve';
import { RolePaymentT, useInfiniteQuery } from 'features.table';
import { Header } from './Header';
import { TabsComponent } from './TabsComponent';
import { useSearch, useNavigate } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetRecipientInvoiceByTutor,
  useGetRecipientInvoiceByStudent,
} from 'common.services';
import { UserRoleT } from 'common.api';

export const PaymentsPage = () => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [paymentApproveModalState, setPaymentApproveModalState] = useState<{
    isOpen: boolean;
    payment: RolePaymentT<'tutor'> | RolePaymentT<'student'> | null;
  }>({ isOpen: false, payment: null });
  const processedInvoiceIdRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { recipient_invoice_id?: string };
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const currentUserRole: UserRoleT = isTutor ? 'tutor' : 'student';

  const recipientInvoiceId = search.recipient_invoice_id
    ? Number(search.recipient_invoice_id)
    : undefined;

  const parentRefForSearch = useRef<HTMLDivElement>(null);
  const { items: paymentsList, isLoading: isLoadingPaymentsList } = useInfiniteQuery(
    parentRefForSearch,
    currentUserRole,
  );

  useEffect(() => {
    if (!search.recipient_invoice_id && processedInvoiceIdRef.current !== null) {
      processedInvoiceIdRef.current = null;
    }
  }, [search.recipient_invoice_id]);
  const {
    data: recipientInvoiceDataByTutor,
    isLoading: isLoadingTutor,
    isError: isErrorTutor,
  } = useGetRecipientInvoiceByTutor(recipientInvoiceId || 0, !recipientInvoiceId || !isTutor);
  const {
    data: recipientInvoiceDataByStudent,
    isLoading: isLoadingStudent,
    isError: isErrorStudent,
  } = useGetRecipientInvoiceByStudent(recipientInvoiceId || 0, !recipientInvoiceId || isTutor);

  const recipientInvoiceData = isTutor
    ? recipientInvoiceDataByTutor
    : recipientInvoiceDataByStudent;
  const isLoading = isTutor ? isLoadingTutor : isLoadingStudent;
  const isError = isTutor ? isErrorTutor : isErrorStudent;

  const removeRecipientInvoiceIdFromUrl = useCallback(() => {
    const newSearch: Record<string, string | undefined> = { ...search };
    delete newSearch.recipient_invoice_id;
    delete newSearch.role;
    navigate({
      // @ts-expect-error - TanStack Router search params typing issue
      search: newSearch,
      replace: true,
    });
  }, [navigate, search]);

  const paymentFromList = useMemo(
    () =>
      recipientInvoiceId
        ? paymentsList.find((payment) => payment.id === recipientInvoiceId)
        : undefined,
    [paymentsList, recipientInvoiceId],
  );

  // Обработка данных из API
  useEffect(() => {
    if (!recipientInvoiceId || !user || isError || isLoading || !recipientInvoiceData) return;
    if (processedInvoiceIdRef.current === recipientInvoiceId) return;

    const invoiceData = recipientInvoiceData as {
      invoice: { created_at: string };
      recipient_invoice: { payment_type: string | null; status: string; total: string };
      student_id: number | null;
      tutor_id?: number | null;
    };

    const paymentDetails: RolePaymentT<'tutor'> | RolePaymentT<'student'> = {
      id: recipientInvoiceId,
      created_at: invoiceData.invoice.created_at,
      total: invoiceData.recipient_invoice.total,
      payment_type: invoiceData.recipient_invoice.payment_type || 'cash',
      status: invoiceData.recipient_invoice.status,
      ...(isTutor
        ? { student_id: invoiceData.student_id || 0 }
        : { tutor_id: invoiceData.tutor_id || invoiceData.student_id || 0 }),
    } as RolePaymentT<'tutor'> | RolePaymentT<'student'>;

    setPaymentApproveModalState({ isOpen: true, payment: paymentDetails });
    processedInvoiceIdRef.current = recipientInvoiceId;
    removeRecipientInvoiceIdFromUrl();
  }, [
    recipientInvoiceId,
    recipientInvoiceData,
    isTutor,
    user,
    isError,
    isLoading,
    removeRecipientInvoiceIdFromUrl,
  ]);

  // Обработка поиска в списке платежей, если API не вернул данные
  useEffect(() => {
    if (!recipientInvoiceId || !user || isError || isLoading || recipientInvoiceData) return;
    if (isLoadingPaymentsList) return;
    if (processedInvoiceIdRef.current === recipientInvoiceId) return;

    if (paymentFromList) {
      processedInvoiceIdRef.current = recipientInvoiceId;
      setPaymentApproveModalState({ isOpen: true, payment: paymentFromList });
      return;
    }

    processedInvoiceIdRef.current = recipientInvoiceId;
    removeRecipientInvoiceIdFromUrl();
  }, [
    recipientInvoiceId,
    user,
    isError,
    isLoading,
    recipientInvoiceData,
    isLoadingPaymentsList,
    paymentFromList,
    removeRecipientInvoiceIdFromUrl,
  ]);

  const onOpenInvoiceModal = () => {
    setIsInvoiceModalOpen(true);
  };

  const onOpenPaymentApproveModal = useCallback(
    (payment: RolePaymentT<'tutor'> | RolePaymentT<'student'>) => {
      setPaymentApproveModalState({ isOpen: true, payment });
    },
    [],
  );

  return (
    <div className="flex flex-col justify-between gap-6 pl-4">
      <div className="flex flex-col">
        <Header onCreateInvoice={onOpenInvoiceModal} />
        <TabsComponent onApprovePayment={onOpenPaymentApproveModal} />
      </div>

      <div className="xs:hidden flex flex-row items-center justify-end">
        <Button
          size="small"
          className="fixed right-4 bottom-10 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <Plus className="fill-brand-0" />
        </Button>
      </div>
      {paymentApproveModalState.isOpen && paymentApproveModalState.payment && (
        <PaymentApproveModal
          open={paymentApproveModalState.isOpen}
          onOpenChange={(open) => {
            setPaymentApproveModalState({ ...paymentApproveModalState, isOpen: open });
            if (!open && search.recipient_invoice_id) {
              const newSearch: Record<string, string | undefined> = { ...search };
              delete newSearch.recipient_invoice_id;
              navigate({
                // @ts-expect-error - TanStack Router search params typing issue
                search: newSearch,
                replace: true,
              });
            }
          }}
          paymentDetails={paymentApproveModalState.payment}
          recipientInvoiceId={paymentApproveModalState.payment.id}
        />
      )}
      {isInvoiceModalOpen && (
        <InvoiceModal open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen} />
      )}
    </div>
  );
};
