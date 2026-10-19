import { useState, useEffect } from 'react';
import { formatAppClock, formatInAppTimeZone } from 'common.utils';
import { getDateLocale } from './i18n/language';
import { useAppTimeZone } from './i18n/useAppTimeZone';

const readNow = () => {
  const now = new Date();
  const locale = getDateLocale();
  return {
    time: formatAppClock(now),
    date: formatInAppTimeZone(now, { weekday: 'long', day: 'numeric', month: 'long' }, locale),
  };
};

export const DateTimeDisplay = () => {
  const timeZone = useAppTimeZone();
  const [currentDateTime, setCurrentDateTime] = useState(readNow);

  useEffect(() => {
    const updateDateTime = () => setCurrentDateTime(readNow());
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, [timeZone]);

  return (
    <div className="flex flex-row items-center justify-start gap-3">
      <div className="text-xl-base text-text-primary dark:text-text-primary font-normal">
        {currentDateTime.time}
      </div>
      <div className="text-m-base text-text-primary dark:text-text-primary font-normal">
        {currentDateTime.date}
      </div>
    </div>
  );
};
