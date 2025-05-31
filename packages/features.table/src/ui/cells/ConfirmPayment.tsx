import { PaymentStatusT } from '../../types';

export const ConfirmPayment = ({ status }: { status: PaymentStatusT }) => {
  return <p className="">{status}</p>;
};
