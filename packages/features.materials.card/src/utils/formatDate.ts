import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import i18n from 'i18next';
import { getAppLanguage } from 'common.ui';

export const formatToShortDate = (isoDate: string): string => {
  return dayjs(isoDate).locale(getAppLanguage()).format('D MMMM');
};

/** Относительная метка для карточки: сегодня / вчера / дата */
export const formatUpdatedLabel = (isoDate: string): string => {
  const date = dayjs(isoDate).locale(getAppLanguage());
  const today = dayjs().startOf('day');
  const target = date.startOf('day');
  const diffDays = today.diff(target, 'day');

  if (diffDays === 0) return String(i18n.t('date.today', { ns: 'materialsCard' }));
  if (diffDays === 1) return String(i18n.t('date.yesterday', { ns: 'materialsCard' }));

  return date.format('D MMMM');
};
