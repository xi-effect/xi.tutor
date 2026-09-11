import { useEffect, useState } from 'react';

/**
 * Высота области снизу экрана, «съеденной» экранной клавиатурой (по `visualViewport`).
 * Возвращает 0, если клавиатуры нет или API недоступен.
 *
 * `threshold` отсекает мелкие изменения визуального вьюпорта (URL-бар,
 * нижняя чрома браузера), которые не являются клавиатурой.
 *
 * Работает на iOS Safari 15+ и Chrome Android: `visualViewport.height`
 * уменьшается при открытии клавиатуры, `window.innerHeight` — нет.
 */
export const useKeyboardInset = (threshold = 120): number => {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let raf = 0;

    const read = () => {
      raf = 0;
      const bottomGap = window.innerHeight - vv.height - vv.offsetTop;
      setInset(bottomGap > threshold ? Math.round(bottomGap) : 0);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    vv.addEventListener('resize', schedule);
    vv.addEventListener('scroll', schedule);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      vv.removeEventListener('resize', schedule);
      vv.removeEventListener('scroll', schedule);
    };
  }, [threshold]);

  return inset;
};
