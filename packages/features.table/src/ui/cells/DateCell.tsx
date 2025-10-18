import { formatDate } from '../../utils/formatDate.tsx';
import { PaymentDataT, RoleT } from '../../types.ts';

type DatePropsT = {
  date: PaymentDataT<RoleT>['created_at'];
};

export const DateCell = ({ date }: DatePropsT) => formatDate(date);
