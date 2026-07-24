import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import { getAppLanguage } from 'common.ui';

export const formatPaymentDate = (dateStr: string): string => {
  const date = dayjs(dateStr).locale(getAppLanguage());
  return date.format('D MMMM, HH:mm');
};
