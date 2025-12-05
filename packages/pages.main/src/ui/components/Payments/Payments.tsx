import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import {
  useCurrentUser,
  useGetStudentPaymentsList,
  useGetTutorPaymentsList,
} from 'common.services';
import { InvoiceModal } from 'features.invoice';
import { InvoiceCard } from 'features.invoice.card';

export const Payments = () => {
  const { data: user } = useCurrentUser();

  const isTutor = user?.default_layout === 'tutor';

  const { data: studentPayments, isLoading: isLoadingStudent } = useGetStudentPaymentsList({
    disabled: isTutor,
  });
  const { data: tutorPayments, isLoading: isLoadingTutor } = useGetTutorPaymentsList({
    disabled: !isTutor,
  });

  const payments = isTutor ? tutorPayments : studentPayments;
  const isLoading = isTutor ? isLoadingTutor : isLoadingStudent;

  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const handleMore = () => {
    // Сохраняем параметр call при переходе к оплатам
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      to: '/payments',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Оплаты</h2>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 items-center justify-center rounded-[4px] p-0"
              onClick={handleMore}
            >
              <ArrowRight className="fill-gray-60 size-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>К оплатам</TooltipContent>
        </Tooltip>

        {isTutor && (
          <div className="ml-auto flex flex-row items-center gap-2 max-sm:hidden">
            <Button
              id="create-invoice-button"
              size="s"
              variant="secondary"
              className="rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
              onClick={() => setIsInvoiceModalOpen(true)}
            >
              Создать счет на оплату
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-row">
        {isLoading && (
          <div className="flex flex-row gap-8">
            <p className="text-m-base text-gray-60">Загрузка...</p>
          </div>
        )}
        {!isLoading && payments && payments.length > 0 && (
          <ScrollArea
            className="h-full min-h-[196px] w-full sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {payments.map((payment) => (
                <InvoiceCard
                  key={payment.id}
                  payment={payment}
                  currentUserRole={isTutor ? 'tutor' : 'student'}
                />
              ))}
            </div>
          </ScrollArea>
        )}
        {!isLoading && (!payments || payments.length === 0) && (
          <div className="flex h-[148px] w-full flex-row items-center justify-center gap-8">
            <p className="text-m-base text-gray-60">Здесь пока пусто</p>
          </div>
        )}
      </div>

      <InvoiceModal open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen} />
    </div>
  );
};
