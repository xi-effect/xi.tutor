import { formatDate } from '../../utils/formatDate';

type DatePropsT = {
  date: string;
};

export const DateCell = ({ date }: DatePropsT) => {
  const formattedDate = formatDate(date);
  return <span>{formattedDate}</span>;
};
