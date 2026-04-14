import { useEffect, useState, RefObject } from 'react';

export const useResponsiveGrid = (
  parentRef: RefObject<HTMLDivElement | null>,
  itemWidth: number,
  gap: number,
  maxColumns: number,
) => {
  const [colCount, setColCount] = useState(1);

  // Вычисляем количество колонок
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;

      const cols = Math.min(maxColumns, Math.max(1, Math.floor((width + gap) / (itemWidth + gap))));
      setColCount(cols);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [parentRef, itemWidth, maxColumns, gap]);

  return { colCount };
};
