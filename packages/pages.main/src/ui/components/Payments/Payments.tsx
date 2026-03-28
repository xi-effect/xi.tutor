import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { Add, ArrowUpRight } from '@xipkg/icons';
import { SectionEmptyState } from '../SectionEmptyState';
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

/** База знаний (как в сайдбаре «Справка») */
const PAYMENTS_HELP_URL = 'https://support.sovlium.ru';

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

  const openPaymentsHelp = () => {
    window.open(PAYMENTS_HELP_URL, '_blank', 'noopener,noreferrer');
  };

  const emptyActionButtonClass =
    'bg-gray-5 hover:bg-gray-10 text-xs-base h-8 rounded-lg px-4 font-medium text-gray-80';

  return (
    <div className="bg-gray-0 flex w-full flex-col gap-4 rounded-2xl px-5 pt-4 pb-1 transition-all duration-200 ease-linear sm:w-[calc(100vw-var(--sidebar-width)-var(--lessons-panel-width)-48px)]">
      <div className="flex flex-row items-center gap-2">
        <h2 className="text-l-base font-medium text-gray-100">Оплата</h2>
        {isTutor ? (
          <div className="ml-auto">
            <Button
              variant="none"
              className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
              onClick={handleAdd}
              data-umami-event="create-invoice-button"
              id="create-invoice-button"
            >
              <Add className="fill-brand-80 size-6" />
            </Button>
          </div>
        ) : null}
      </div>
      <InvoiceModal open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen} />

      {isLoading ? (
        <div className="flex h-[152px] w-full items-center justify-center">
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
      ) : isTutor ? (
        <SectionEmptyState
          title="У вас нет платежей"
          description="Вы можете выставить счет на оплату или почитать подробнее в базе знаний"
          minHeightClass="min-h-[166px]"
          actions={
            <>
              <Button
                type="button"
                variant="none"
                className={emptyActionButtonClass}
                onClick={openPaymentsHelp}
                data-umami-event="payments-empty-help"
              >
                Как работает оплата
                <ArrowUpRight className="fill-gray-80 ml-1 size-4 shrink-0" />
              </Button>
              <Button
                type="button"
                variant="none"
                className={emptyActionButtonClass}
                onClick={handleAdd}
                data-umami-event="payments-empty-invoice"
              >
                Счет на оплату
                <Add className="fill-gray-80 ml-1 size-4 shrink-0" />
              </Button>
            </>
          }
        />
      ) : (
        <SectionEmptyState
          title="У вас нет платежей"
          description="Счета от репетиторов появятся здесь после выставления"
          minHeightClass="min-h-[152px]"
          actions={
            <Button
              type="button"
              variant="none"
              className={emptyActionButtonClass}
              onClick={handleMore}
              data-umami-event="payments-empty-more"
            >
              Подробнее о финансах
              <ArrowUpRight className="fill-gray-80 ml-1 size-4 shrink-0" />
            </Button>
          }
        />
      )}
    </div>
  );
};
