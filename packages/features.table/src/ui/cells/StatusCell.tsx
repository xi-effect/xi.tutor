import clsx from 'clsx';
import { Button } from '@xipkg/button';
import { Check } from '@xipkg/icons';
import { getStatusColor } from '../../utils';
import { mapPaymentStatus, PaymentStatusT } from '../../types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { usePaymentReceiverConfirmation } from 'common.services';

type StatusCellPropsT = {
  status: PaymentStatusT;
  isTutor?: boolean;
  onApprovePayment: () => void;
  id?: number;
};

export const StatusCell = ({ status, onApprovePayment, isTutor = false, id }: StatusCellPropsT) => {
  const { mutate: receiverConfirmationMutation, isPending } = usePaymentReceiverConfirmation();
  const statusText = mapPaymentStatus[status];

  if (!statusText) {
    throw new Error('Paiment Status not found');
  }

  return (
    <div className="flex flex-row items-center justify-between gap-8">
      <div className={clsx('font-normal', 'text-m-base', getStatusColor(status))}>{statusText}</div>

      {status === 'wf_sender_confirmation' && (
        <div className="flex flex-row items-center justify-between gap-4">
          <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="s"
                className="bg-brand-0 hover:bg-brand-0/80 rounded-lg"
                onClick={onApprovePayment}
              >
                <span className="text-s-base text-brand-100 hidden font-medium md:block">
                  Подтвердить
                </span>
                <Check className="fill-brand-100 block md:hidden" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="z-99999!">
              {isTutor
                ? 'Если счёт уже оплачен, можно подтвердить, не дожидаясь подтвержения ученика'
                : 'Подтвердите оплату счета, чтобы репетитор знал об этом'}
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      {status === 'wf_receiver_confirmation' && isTutor && (
        <div className="flex flex-row items-center justify-between gap-4">
          <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="s"
                className="bg-brand-0 hover:bg-brand-0/80 rounded-lg"
                onClick={() => receiverConfirmationMutation(id?.toString() ?? '')}
                loading={isPending}
                disabled={isPending}
              >
                <span className="text-s-base text-brand-100 hidden font-medium md:block">
                  Подтвердить
                </span>
                <Check className="fill-brand-100 block md:hidden" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="z-99999!">
              Ученик оплатил счет, подтвердите получение средств
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
