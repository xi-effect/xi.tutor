import { PaymentDataT, RoleT } from '../../types';

type AmountPropsT = {
  total: PaymentDataT<RoleT>['total'];
};

export const AmountPaymentCell = ({ total }: AmountPropsT) => {
  return (
    <>
      <span className="text-text-link text-m-base font-normal">{total} </span>
      <span className="text-text-link text-xs-base font-normal">₽</span>
    </>
  );
};
