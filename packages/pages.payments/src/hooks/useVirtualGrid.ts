import { useVirtualizer } from '@tanstack/react-virtual';
import { RefObject } from 'react';

export const useVirtualGrid = (
  parentRef: RefObject<HTMLDivElement | null>,
  items: unknown[],
  colCount: number,
  rowHeight: number,
) => {
  const rowCount = Math.ceil(items.length / colCount);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return rowVirtualizer;
};
