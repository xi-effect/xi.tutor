import clsx from 'clsx';
import { Button } from '@xipkg/button';
import { Edit, Trash, Check } from '@xipkg/icons';

import { mapPaymentStatus, PaymentStatusT } from '../../types';

const getColor = (status: PaymentStatusT) => {
  switch (status) {
    case 'paid':
      return 'text-green-100';

    case 'processing':
      return 'text-brand-100';

    case 'unpaid':
      return 'text-red-100';

    default:
      return '';
  }
};

export const StatusCell = ({ status }: { status: PaymentStatusT }) => {
  const statusText = mapPaymentStatus[status];

  if (!statusText) {
    throw new Error('Paiment Status not found');
  }

  return (
    <div className="flex flex-row items-center justify-between gap-8">
      <div className={clsx('font-normal', 'text-m-base', getColor(status))}>{statusText}</div>

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
