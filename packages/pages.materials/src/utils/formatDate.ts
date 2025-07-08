import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export const formatToShortDate = (isoDate: string): string => {
  return dayjs(isoDate).locale('ru').format('D MMMM');
};
