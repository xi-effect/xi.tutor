import { useCallback, useEffect, useState } from 'react';

/** Минимальная ширина столбца дня (px) */
export const COLUMN_MIN_WIDTH = 240;

/**
 * Внутренний отступ справа у области скролла канбана (`ScheduleKanban`: `pr-6`).
 * В расчёт ширины колонок нужно закладывать **до** `repeat(..., minmax(...))`, иначе
 * сумма колонок + gap чуть шире фактической ширины контента → горизонтальный overflow
 * и последняя колонка визуально «под» overlay-скроллбаром.
 */
export const KANBAN_SCROLL_INNER_PADDING_END_PX = 24;

/** Зазор между колонками (gap-7 = 28px) */
const COLUMN_GAP = 28;

/** Минимальная ширина карточки занятия (px) */
export const CARD_MIN_WIDTH = 200;
/** Максимальная ширина карточки занятия (px) */
export const CARD_MAX_WIDTH = 420;

/**
 * Считает ширину контейнера и возвращает число видимых дней и равную долю ширины
 * на колонку (с учётом gap), чтобы колонки заполняли строку без горизонтального скролла.
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
    const availableForColumns = containerWidth - KANBAN_SCROLL_INNER_PADDING_END_PX;
    if (availableForColumns < COLUMN_MIN_WIDTH) return;
    // Сколько колонок помещается: n * COLUMN_MIN_WIDTH + (n - 1) * GAP <= availableForColumns
    const maxVisible = Math.max(
      1,
      Math.floor((availableForColumns + COLUMN_GAP) / (COLUMN_MIN_WIDTH + COLUMN_GAP)),
    );
    const count = Math.min(totalDays, maxVisible);
    const width = Math.max(
      COLUMN_MIN_WIDTH,
      (availableForColumns - (count - 1) * COLUMN_GAP) / count,
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
