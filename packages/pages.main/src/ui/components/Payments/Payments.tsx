import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { Add, ArrowUpRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import {
  useCurrentUser,
  useGetTutorPaymentsList,
  useGetStudentPaymentsList,
} from 'common.services';
import { InvoiceModal } from 'features.invoice';
import { InvoiceCard } from 'features.invoice.card';
import { useState } from 'react';

const PAYMENTS_PREVIEW_LIMIT = 10;

export const Payments = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { data: tutorPayments, isLoading: isLoadingTutor } = useGetTutorPaymentsList({
    disabled: !isTutor,
  });
  const { data: studentPayments, isLoading: isLoadingStudent } = useGetStudentPaymentsList({
    disabled: isTutor,
  });

  const payments = isTutor ? tutorPayments : studentPayments;
  const isLoading = isTutor ? isLoadingTutor : isLoadingStudent;
  const previewList = (payments ?? []).slice(0, PAYMENTS_PREVIEW_LIMIT);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const handleMore = () => {
    const filteredSearch = search.call ? { call: search.call } : {};
    navigate({
      to: '/payments',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  const handleAdd = () => {
    setInvoiceModalOpen(true);
  };

  return (
    <div className="bg-gray-0 flex w-full flex-col gap-4 rounded-2xl px-5 pt-4 pb-1 transition-all duration-200 ease-linear sm:w-[calc(100vw-var(--sidebar-width)-var(--lessons-panel-width)-48px)]">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-l-base font-medium text-gray-100">Оплата</h2>
        <Button
          variant="none"
          className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
          onClick={handleAdd}
          data-umami-event="create-invoice-button"
          id="create-invoice-button"
        >
          <Add className="fill-brand-80 size-6" />
        </Button>
        <InvoiceModal open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen} />
      </div>

      {isLoading ? (
        <div className="flex h-[178px] w-full items-center justify-center">
          <p className="text-m-base text-gray-60">Загрузка...</p>
        </div>
      ) : previewList.length > 0 ? (
        <ScrollArea className="w-full" scrollBarProps={{ orientation: 'horizontal' }}>
          <div className="flex flex-row gap-3 pb-3">
            {previewList.map((payment) => (
              <InvoiceCard
                key={payment.id}
                payment={payment}
                currentUserRole={isTutor ? 'tutor' : 'student'}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[178px] w-full flex-col items-center justify-center gap-2">
          <p className="text-m-base text-gray-60 text-center">Пока нет платежей</p>
          <Button
            variant="none"
            size="s"
            className="border-gray-30 rounded-lg border"
            onClick={handleMore}
          >
            Подробнее о финансах
            <ArrowUpRight className="ml-2 size-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
