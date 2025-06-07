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
        <div className="flex flex-row items-center justify-between gap-4">
          <Button variant="ghost" size="s" className="bg-brand-0 hover:bg-brand-0/80 rounded-lg">
            <span className="text-s-base text-brand-100 hidden font-medium min-md:block">
              Подтвердить
            </span>
            <Check className="fill-brand-100 block min-md:hidden" />
          </Button>

          <div className="flex flex-row items-center justify-between gap-2">
            <Button className="size-8 rounded-lg p-0" variant="ghost" size="s">
              <Edit className="size-4 fill-gray-100" />
            </Button>

            <Button className="size-8 rounded-lg p-0" variant="ghost" size="s">
              <Trash className="size-4 fill-gray-100" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
