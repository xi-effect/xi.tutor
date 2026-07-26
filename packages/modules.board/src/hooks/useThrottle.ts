import { useCallback, useRef } from 'react';

export const useThrottle = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): ((...args: Args) => void) => {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<number | null>(null);

  return useCallback(
    (...args: Args) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        // Отменяем предыдущий отложенный вызов
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current);
        }

        // Планируем новый вызов
        lastCallTimer.current = setTimeout(
          () => {
            lastCall.current = Date.now();
            callback(...args);
          },
          delay - (now - lastCall.current),
        );
      }
    },
    [callback, delay],
  );
};
