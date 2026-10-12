import i18n from 'i18next';
import {
  formatAppClock,
  formatInAppTimeZone,
  getAppCalendarDayDiff,
  getDateLocale,
} from 'common.ui';

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const classnameFirstLine = 'text-text-primary font-normal text-s-base';
  const classnameSecondLine = 'text-text-secondary font-normal text-xs-base';

  if (Number.isNaN(date.getTime())) {
    return <p className={classnameFirstLine}>{dateStr}</p>;
  }

  const locale = getDateLocale();
  const formattedTime = <p className={classnameSecondLine}>{formatAppClock(date)}</p>;
  const dayDiff = getAppCalendarDayDiff(date);

  if (dayDiff === 0) {
    return (
      <>
        <p className={classnameFirstLine}>{i18n.t('date.today', { ns: 'paymentsTable' })}</p>
        {formattedTime}
      </>
    );
  }

  if (dayDiff === -1) {
    return (
      <>
        <p className={classnameFirstLine}>{i18n.t('date.yesterday', { ns: 'paymentsTable' })}</p>
        {formattedTime}
      </>
    );
  }

  return (
    <>
      <p className={classnameFirstLine}>
        {formatInAppTimeZone(date, { day: 'numeric', month: 'long' }, locale)}
      </p>
      {formattedTime}
    </>
  );
};
