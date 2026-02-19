import { useState, useEffect } from 'react';

export const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(() => {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const weekday = now.toLocaleDateString('ru-RU', { weekday: 'long' });
    const day = now.getDate();
    const month = now.toLocaleDateString('ru-RU', { month: 'long' });
    return { time, date: `${weekday}, ${day} ${month}` };
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      const weekday = now.toLocaleDateString('ru-RU', { weekday: 'long' });
      const day = now.getDate();
      const month = now.toLocaleDateString('ru-RU', { month: 'long' });
      setCurrentDateTime({ time, date: `${weekday}, ${day} ${month}` });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Обновляем каждую минуту

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-row items-center justify-start gap-3">
      <div className="text-xl-base font-normal text-gray-100">{currentDateTime.time}</div>
      <div className="text-m-base font-normal text-gray-100">{currentDateTime.date}</div>
    </div>
  );
};
