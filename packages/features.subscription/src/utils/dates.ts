import dayjs from 'dayjs';
import { getDateLocale } from 'common.ui';

export const formatRenewalDate = (iso: string): string =>
  dayjs(iso)
    .locale(getDateLocale().startsWith('en') ? 'en' : 'ru')
    .format('D MMMM YYYY');

export const formatRenewalDateShort = (iso: string): string =>
  dayjs(iso)
    .locale(getDateLocale().startsWith('en') ? 'en' : 'ru')
    .format('D MMMM');
