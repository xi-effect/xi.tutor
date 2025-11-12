import { useVirtualizer } from '@tanstack/react-virtual';
import { RefObject } from 'react';

const ESTIMATED_ITEM_HEIGHT = 100; // Примерная высота одного уведомления

/**
 * Хук для виртуализации списка уведомлений
 * По аналогии с useVirtualGrid из materials, но для вертикального списка
 */
export const useVirtualList = <T>(parentRef: RefObject<HTMLDivElement | null>, items: T[]) => {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ITEM_HEIGHT,
    overscan: 5,
  });

  return virtualizer;
};
