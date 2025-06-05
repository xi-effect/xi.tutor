import clsx from 'clsx';
import { Button } from '@xipkg/button';
import { Edit, Trash, Check } from '@xipkg/icons';

import { mapPaymentStatus, PaymentStatusT } from '../../types';

const statusColorMap: Record<PaymentStatusT, string> = {
  paid: 'text-green-100',
  processing: 'text-brand-100',
  unpaid: 'text-red-100',
};

export const StatusCell = ({ status }: { status: PaymentStatusT }) => {
  const statusText = mapPaymentStatus[status];

  if (!statusText) {
    throw new Error('Paiment Status not found');
  }

  return (
    <div className="flex flex-row items-center justify-between gap-8">
      <div className={clsx('font-normal', 'text-m-base', statusColorMap[status])}>{statusText}</div>

      {status === 'processing' && (
        <div className="flex flex-row items-center justify-between gap-1">
          <Button variant="ghost" size="s" className="bg-brand-0 rounded-lg px-1 py-4">
            <span className="text-s-base text-brand-100 hidden font-medium min-md:block">
              Подтвердить
            </span>
            <Check className="fill-brand-100 block min-md:hidden" />
          </Button>

          <div className="flex flex-row items-center justify-between gap-2">
            <Button variant="ghost" size="s">
              <Edit className="fill-gray-100" />
            </Button>

            <Button variant="ghost" size="s">
              <Trash className="fill-gray-100" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
