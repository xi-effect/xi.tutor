import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

export const formatPaymentDate = (dateStr: string): string => {
  const date = dayjs(dateStr);
  return date.format('D MMMM, HH:mm');
};
