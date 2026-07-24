import { useState, useEffect } from 'react';
import { getDateLocale } from './i18n/language';

export const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(() => {
    const now = new Date();
    const locale = getDateLocale();
    const time = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return { time, date };
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const locale = getDateLocale();
      const time = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
      const date = now.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      setCurrentDateTime({ time, date });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Обновляем каждую минуту

    return () => clearInterval(interval);
  }, []);

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
