import { useCallback, useEffect, useState } from 'react';

/** Минимальная ширина столбца дня (px) */
export const COLUMN_MIN_WIDTH = 240;
/** Максимальная ширина столбца дня (px) */
export const COLUMN_MAX_WIDTH = 320;

/** Горизонтальный отступ контейнера канбана (px-7 = 28px * 2) */
const CONTAINER_PADDING_X = 56;
/** Зазор между колонками (gap-7 = 28px) */
const COLUMN_GAP = 28;

/** Минимальная ширина карточки занятия (px) */
export const CARD_MIN_WIDTH = 220;
/** Максимальная ширина карточки занятия (px) */
export const CARD_MAX_WIDTH = 300;

/**
 * Считает доступную ширину контейнера и возвращает количество столбцов,
 * которые помещаются без горизонтального скролла, и ширину одного столбца.
 * Учитывает padding контейнера и gap между колонками.
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

    const containerWidth = el.clientWidth;
    if (containerWidth <= CONTAINER_PADDING_X) return;

    const availableForColumns = containerWidth - CONTAINER_PADDING_X;
    // Сколько колонок помещается: n * COLUMN_MIN_WIDTH + (n - 1) * GAP <= availableForColumns
    const maxVisible = Math.max(
      1,
      Math.floor((availableForColumns + COLUMN_GAP) / (COLUMN_MIN_WIDTH + COLUMN_GAP)),
    );
    const count = Math.min(totalDays, maxVisible);
    const width = Math.min(
      COLUMN_MAX_WIDTH,
      Math.max(COLUMN_MIN_WIDTH, (availableForColumns - (count - 1) * COLUMN_GAP) / count),
    );

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
