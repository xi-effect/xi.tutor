import clsx from 'clsx';
import { Button } from '@xipkg/button';
import { Check } from '@xipkg/icons';

import { mapPaymentStatus, PaymentStatusT } from '../../types';

export const statusColorMap: Record<PaymentStatusT, string> = {
  paid: 'text-green-100',
  processing: 'text-brand-100',
  unpaid: 'text-red-100',
};

type StatusCellPropsT = {
  status: PaymentStatusT;
  onApprovePayment: () => void;
};

export const StatusCell = ({ status, onApprovePayment }: StatusCellPropsT) => {
  const statusText = mapPaymentStatus[status];

  if (!statusText) {
    throw new Error('Paiment Status not found');
  }

  return (
    <div className="flex flex-row items-center justify-between gap-8">
      <div className={clsx('font-normal', 'text-m-base', statusColorMap[status])}>{statusText}</div>

      {status === 'processing' && (
        <div className="flex flex-row items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="s"
            className="bg-brand-0 hover:bg-brand-0/80 rounded-lg"
            onClick={onApprovePayment}
          >
            <span className="text-s-base text-brand-100 hidden font-medium min-md:block">
              Подтвердить
            </span>
            <Check className="fill-brand-100 block min-md:hidden" />
          </Button>
        </div>
      )}
    </div>
  );
};
