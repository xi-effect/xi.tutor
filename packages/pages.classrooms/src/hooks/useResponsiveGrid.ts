import { useEffect, useState, RefObject } from 'react';

const ITEM_WIDTH = 320; // Ширина карточки класса
const GAP = 20; // Отступ между карточками
const MAX_COLUMNS = 4; // Максимальное количество колонок

export const useResponsiveGrid = (parentRef: RefObject<HTMLDivElement | null>) => {
  const [colCount, setColCount] = useState(1);
  const [rowHeight, setRowHeight] = useState(200); // Высота карточки класса

  // Измеряем высоту карточки
  useEffect(() => {
    const cardElement = parentRef.current?.querySelector('.classroom-card');
    if (!cardElement) return;

    const ro = new ResizeObserver(([entry]) => {
      const { height } = entry.contentRect;
      setRowHeight(height + GAP);
    });
    ro.observe(cardElement);
    return () => ro.disconnect();
  }, []);

  // Вычисляем количество колонок
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
  }, []);

  return { colCount, rowHeight, GAP };
};
