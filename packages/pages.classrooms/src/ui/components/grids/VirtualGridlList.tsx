import { useVirtualizer } from '@tanstack/react-virtual';
import { RefObject, useCallback } from 'react';
import { useResponsiveGrid } from '../../../hooks';

interface IItem {
  id: number;
}

type VirtualGridlListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  parentRef: RefObject<HTMLDivElement | null>;
  defaultRowHeight?: number;
  minItemWidth?: number;
  gap?: number;
  maxColumns?: number;
};

export const VirtualGridlList = <T extends IItem>({
  items,
  renderItem,
  className,
  parentRef,
  defaultRowHeight = 100,
  minItemWidth = 0,
  gap = 0,
  maxColumns = 1,
}: VirtualGridlListProps<T>) => {
  const { colCount } = useResponsiveGrid(parentRef, minItemWidth, gap, maxColumns);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(items.length / colCount),
    getScrollElement: () => parentRef.current,
    estimateSize: () => defaultRowHeight,
    overscan: 5,
  });

  const measureRow = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) {
        rowVirtualizer.measureElement(element);
      }
    },
    [rowVirtualizer],
  );

  return (
    <div
      className={className}
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualItem) => {
        const startIndex = virtualItem.index * colCount;
        const endIndex = Math.min(startIndex + colCount, items.length);
        const rowItems = items.slice(startIndex, endIndex);

        return (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={measureRow}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              display: 'grid',
              gap,
              paddingRight: gap,
              paddingBottom: gap,
              gridTemplateColumns: `repeat(${colCount}, minmax(${minItemWidth}px,1fr)`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {rowItems.map((item) => (
              <div key={item.id}>{renderItem(item)}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
