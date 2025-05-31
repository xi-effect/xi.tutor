import { mapPaymentStatus, PaymentStatusT } from '../../types';

// const getColor = (status: PaymentStatusT) => {
//   switch (status) {
//     case 'paid':
//       return 'text-green-600';
//     case 'processing':
//       return 'text-blue-600';
//     case 'unpaid':
//       return 'text-orange-600';
//     default:
//       return '';
//   }
// };

export const StatusCell = ({ status }: { status: PaymentStatusT }) => {
  const statusText = mapPaymentStatus[status];

  if (!statusText) {
    throw new Error('Paiment Status not found');
  }

  return <span>{statusText}</span>;
};
