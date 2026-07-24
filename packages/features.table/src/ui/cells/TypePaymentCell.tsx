import { PaymentDataT, RoleT, getPaymentTypeLabels } from '../../types';

type PaymentPropsT = {
  paymentType: PaymentDataT<RoleT>['payment_type'];
};

export const TypePaymentCell = ({ paymentType }: PaymentPropsT) => {
  const processedType = getPaymentTypeLabels()[paymentType];

  return <p className="text-text-primary text-m-base font-normal">{processedType || ''}</p>;
};
