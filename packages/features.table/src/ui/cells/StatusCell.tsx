import clsx from 'clsx';
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

  return <p className={clsx('font-normal', 'text-m-base', getColor(status))}>{statusText}</p>;
};
