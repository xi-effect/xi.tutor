import { Button } from '@xipkg/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { usePaymentReceiverConfirmation } from 'common.services';
import { PaymentApproveButtonPropsT } from '../types';
import { PaymentApproveButtonContent } from './PaymentApproveButtonContent';

export const PaymentApproveButton = ({
  type = 'default',
  status,
  onApprovePayment,
  isTutor = false,
  id,
  classroomId,
}: PaymentApproveButtonPropsT) => {
  const { mutate: receiverConfirmationMutation, isPending } = usePaymentReceiverConfirmation({
    classroomId: classroomId?.toString(),
  });

  if (status === 'wf_sender_confirmation')
    return (
      <div className="flex flex-row items-center justify-between gap-4">
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="s"
              className="bg-brand-0 hover:bg-brand-0/80 flex-1 rounded-lg"
              onClick={onApprovePayment}
            >
              <PaymentApproveButtonContent type={type} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="z-99999!">
            {isTutor
              ? 'Если счёт уже оплачен, можно подтвердить, не дожидаясь подтвержения ученика'
              : 'Подтвердите оплату счета, чтобы репетитор знал об этом'}
          </TooltipContent>
        </Tooltip>
      </div>
    );

  if (status === 'wf_receiver_confirmation' && isTutor)
    return (
      <div className="flex flex-row items-center justify-between gap-4">
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="s"
              className="bg-brand-0 hover:bg-brand-0/80 flex-1 rounded-lg"
              onClick={() => receiverConfirmationMutation(id?.toString() ?? '')}
              loading={isPending}
              disabled={isPending}
            >
              <PaymentApproveButtonContent type={type} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="z-99999!">
            Ученик оплатил счет, подтвердите получение средств
          </TooltipContent>
        </Tooltip>
      </div>
    );

  return null;
};
