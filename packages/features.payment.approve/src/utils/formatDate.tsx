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

  const classnameFirstLine = 'text-s-base text-text-primary';
  const classnameSecondLine = 'text-xs-base text-text-secondary';

  const formattedTime = <p className={classnameSecondLine}>{date.format('HH:mm')}</p>;

  if (date.isToday()) {
    return (
      <>
        <p className={classnameFirstLine}>{i18n.t('date.today', { ns: 'paymentApprove' })}</p>
        {formattedTime}
      </>
    );
  }

  if (date.isYesterday()) {
    return (
      <>
        <p className={classnameFirstLine}>{i18n.t('date.yesterday', { ns: 'paymentApprove' })}</p>
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
