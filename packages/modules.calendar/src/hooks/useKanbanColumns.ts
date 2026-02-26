import { useCallback, useEffect, useState } from 'react';

/** Минимальная ширина столбца дня (px) */
export const COLUMN_MIN_WIDTH = 200;
/** Максимальная ширина столбца дня (px) */
export const COLUMN_MAX_WIDTH = 320;

/** Минимальная ширина карточки занятия (px) */
export const CARD_MIN_WIDTH = 180;
/** Максимальная ширина карточки занятия (px) */
export const CARD_MAX_WIDTH = 300;

/**
 * Считает доступную ширину контейнера и возвращает количество столбцов,
 * которые помещаются без горизонтального скролла, и ширину одного столбца.
 */
export const useKanbanColumns = (
  containerRef: React.RefObject<HTMLElement | null>,
  totalDays: number,
) => {
  const [columnWidth, setColumnWidth] = useState(COLUMN_MIN_WIDTH);
  const [visibleCount, setVisibleCount] = useState(totalDays);

  const updateColumns = useCallback(() => {
    const el = containerRef.current;
    if (!el || totalDays === 0) return;

    const availableWidth = el.clientWidth;
    if (availableWidth <= 0) return;

    // Сколько столбцов помещается при минимальной ширине
    const maxVisible = Math.max(1, Math.floor(availableWidth / COLUMN_MIN_WIDTH));
    const count = Math.min(totalDays, maxVisible);
    const width = Math.min(COLUMN_MAX_WIDTH, Math.max(COLUMN_MIN_WIDTH, availableWidth / count));

    setVisibleCount(count);
    setColumnWidth(width);
  }, [containerRef, totalDays]);

  useEffect(() => {
    updateColumns();
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(updateColumns);
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, totalDays, updateColumns]);

  return { columnWidth, visibleCount };
};
