import { PaymentDataT, RoleT, mapPaymentType } from '../../types';

type PaymentPropsT = {
  paymentType: PaymentDataT<RoleT>['payment_type'];
};

export const TypePaymentCell = ({ paymentType }: PaymentPropsT) => {
  const processedType = mapPaymentType[paymentType];

  return <p className="text-gray-80 text-m-base font-normal">{processedType || ''}</p>;
};
