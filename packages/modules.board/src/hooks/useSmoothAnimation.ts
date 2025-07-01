import { useRef, useCallback, useEffect } from 'react';

interface SmoothAnimationOptions {
  threshold?: number;
  throttleMs?: number;
  useRequestAnimationFrame?: boolean;
}

/**
 * Хук для оптимизации плавной анимации
 * Предотвращает излишние обновления и обеспечивает плавные переходы
 */
export const useSmoothAnimation = <T>(
  value: T,
  callback: (value: T) => void,
  options: SmoothAnimationOptions = {},
) => {
  const { threshold = 0.01, throttleMs = 16, useRequestAnimationFrame = true } = options;

  const lastValueRef = useRef<T>(value);
  const timeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const executeCallback = useCallback(
    (currentValue: T) => {
      if (useRequestAnimationFrame) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          callback(currentValue);
        });
      } else {
        callback(currentValue);
      }
    },
    [callback, useRequestAnimationFrame],
  );

  const throttledCallback = useCallback(
    (currentValue: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        executeCallback(currentValue);
      }, throttleMs);
    },
    [executeCallback, throttleMs],
  );

  useEffect(() => {
    // Проверяем, изменилось ли значение значительно
    const hasSignificantChange =
      typeof value === 'number' && typeof lastValueRef.current === 'number'
        ? Math.abs((value as number) - (lastValueRef.current as number)) > threshold
        : value !== lastValueRef.current;

    if (hasSignificantChange) {
      throttledCallback(value);
      lastValueRef.current = value;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, throttledCallback, threshold]);

  // Функция для принудительного выполнения callback
  const forceUpdate = useCallback(() => {
    executeCallback(value);
  }, [executeCallback, value]);

  return { forceUpdate };
};

/**
 * Хук для плавного масштабирования
 */
export const useSmoothScale = (
  scale: number,
  onScaleChange: (scale: number) => void,
  options: SmoothAnimationOptions = {},
) => {
  return useSmoothAnimation(scale, onScaleChange, {
    threshold: 0.02,
    throttleMs: 32,
    useRequestAnimationFrame: true,
    ...options,
  });
};

/**
 * Хук для плавного перемещения
 */
export const useSmoothPosition = (
  position: { x: number; y: number },
  onPositionChange: (position: { x: number; y: number }) => void,
  options: SmoothAnimationOptions = {},
) => {
  return useSmoothAnimation(position, onPositionChange, {
    threshold: 1,
    throttleMs: 16,
    useRequestAnimationFrame: true,
    ...options,
  });
};
