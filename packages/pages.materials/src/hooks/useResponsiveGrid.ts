import { useEffect, useState, RefObject } from 'react';

/** Минимальная ширина карточки — от неё считаем, сколько колонок влезает */
const ITEM_WIDTH = 256;
const GAP = 20;
const MAX_COLUMNS = 3;

export const useResponsiveGrid = (
  parentRef: RefObject<HTMLDivElement | null>,
  isFiles: boolean = false,
) => {
  const [colCount, setColCount] = useState(1);
  const [rowHeight, setRowHeight] = useState(isFiles ? 112 : 180);

  // Измеряем высоту карточки
  useEffect(() => {
    const cardElement = parentRef.current?.querySelector('.card-item');
    if (!cardElement) return;

    const ro = new ResizeObserver(([entry]) => {
      const { height } = entry.contentRect;
      setRowHeight(height + GAP);
    });
    ro.observe(cardElement);
    return () => ro.disconnect();
  }, [parentRef]);

  // Вычисляем количество колонок по доступной ширине
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      const cols = Math.min(
        MAX_COLUMNS,
        Math.max(1, Math.floor((width + GAP) / (ITEM_WIDTH + GAP))),
      );
      setColCount(cols);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [parentRef]);

  return { colCount, rowHeight, GAP };
};
