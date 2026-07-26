import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import { getAppLanguage } from 'common.ui';

export const formatToShortDate = (isoDate: string): string => {
  return dayjs(isoDate).locale(getAppLanguage()).format('D MMMM');
};
