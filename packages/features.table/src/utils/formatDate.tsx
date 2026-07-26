import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import i18n from 'i18next';
import { getAppLanguage } from 'common.ui';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const formatDate = (dateStr: string) => {
  const date = dayjs(dateStr).locale(getAppLanguage());

  const classnameFirstLine = 'text-text-primary font-normal text-s-base';
  const classnameSecondLine = 'text-text-secondary font-normal text-xs-base';

  const formattedTime = <p className={classnameSecondLine}>{date.format('HH:mm')}</p>;

  if (date.isToday()) {
    return (
      <>
        <p className={classnameFirstLine}>{i18n.t('date.today', { ns: 'paymentsTable' })}</p>
        {formattedTime}
      </>
    );
  }

  if (date.isYesterday()) {
    return (
      <>
        <p className={classnameFirstLine}>{i18n.t('date.yesterday', { ns: 'paymentsTable' })}</p>
        {formattedTime}
      </>
    );
  }

  return (
    <>
      <p className={classnameFirstLine}>{date.format('D MMMM')}</p>
      <p className={classnameSecondLine}>{date.format('HH:mm')}</p>
    </>
  );
};
