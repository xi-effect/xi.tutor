import { formatDate } from '../../utils/formatDate.tsx';

type DatePropsT = {
  date: string;
};

export const DateCell = ({ date }: DatePropsT) => formatDate(date);
