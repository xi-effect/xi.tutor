import { useEffect, useState } from 'react';

export const App = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Таймер</h1>

      <div className="mb-6 font-mono text-6xl">{formatTime(time)}</div>

      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Старт
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
          >
            Пауза
          </button>
        )}

        <button
          onClick={handleReset}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Сброс
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Состояние: {isRunning ? '⏱️ Работает' : '⏸️ Остановлен'}
      </div>
    </div>
  );
};
