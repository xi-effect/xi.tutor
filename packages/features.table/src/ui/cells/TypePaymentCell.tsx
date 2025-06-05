import { mapPaymentType, PaymentT } from '../../types';

export const TypePaymentCell = ({ typePayment }: { typePayment: PaymentT['typePayment'] }) => {
  const paymentType = mapPaymentType[typePayment];

  if (!paymentType) {
    throw new Error('Payment type not found');
  }

  return <p className="text-gray-80 text-m-base font-normal">{paymentType}</p>;
};
