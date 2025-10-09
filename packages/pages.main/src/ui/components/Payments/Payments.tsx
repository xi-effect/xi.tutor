import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useCurrentUser } from 'common.services';
import { InvoiceModal } from 'features.invoice';
import { Payment } from './Payment';

const paymentsMock = [
  {
    id: 1,
    name: 'Past simple — 1',
    updated_at: '9 февраля',
  },
  {
    id: 2,
    name: 'Past simple — 2',
    updated_at: '9 февраля',
  },
  {
    id: 3,
    name: 'Past simple — 3',
    updated_at: '9 февраля',
  },
];

export const Payments = () => {
  const { data: user } = useCurrentUser();

  const isTutor = user?.default_layout === 'tutor';

  const navigate = useNavigate();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const handleMore = () => {
    navigate({
      to: '/payments',
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
        {paymentsMock && paymentsMock.length > 0 && (
          <ScrollArea
            className="h-[110px] w-full sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {paymentsMock.map((_, index) => (
                <Payment key={index} />
              ))}
            </div>
          </ScrollArea>
        )}
        {paymentsMock && paymentsMock.length === 0 && (
          <div className="flex flex-row gap-8">
            <p className="text-m-base text-gray-60">Здесь пока пусто</p>
          </div>
        )}
      </div>

      <InvoiceModal open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen} />
    </div>
  );
};
