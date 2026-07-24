import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ru';
import 'dayjs/locale/en';
import { getAppLanguage } from 'common.ui';

dayjs.extend(relativeTime);
dayjs.extend(utc);

export const getRelativeTime = (dateString: string): string => {
  const date = dayjs.utc(dateString).local();
  return dayjs().locale(getAppLanguage()).to(date);
};
