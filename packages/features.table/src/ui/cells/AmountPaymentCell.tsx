import { PaymentDataT, RoleT } from '../../types';

type AmountPropsT = {
  total: PaymentDataT<RoleT>['total'];
};

export const AmountPaymentCell = ({ total }: AmountPropsT) => {
  return (
    <>
      <span className="text-brand-100 text-m-base font-normal">{total} </span>
      <span className="text-brand-40 text-xs-base font-normal">₽</span>
    </>
  );
};
