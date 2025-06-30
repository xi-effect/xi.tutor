import { useCallback, useRef } from 'react';

export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): T => {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<number | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
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
    }) as T,
    [callback, delay],
  );
};
