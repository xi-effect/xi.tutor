import { useState, useEffect } from 'react';

export const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(() => {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return { time, date };
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      const date = now.toLocaleDateString('ru-RU', {
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
      <div className="text-xl-base text-gray-90 font-normal dark:text-gray-100">
        {currentDateTime.time}
      </div>
      <div className="text-m-base text-gray-90 font-normal dark:text-gray-100">
        {currentDateTime.date}
      </div>
    </div>
  );
};
