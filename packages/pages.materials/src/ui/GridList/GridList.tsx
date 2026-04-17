import type { Virtualizer } from '@tanstack/react-virtual';

type GridListProps<T> = {
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  colCount: number;
  gap: number;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  minItemWidth?: number;
};

export const GridList = <T,>({
  rowVirtualizer,
  colCount,
  gap,
  items,
  renderItem,
  minItemWidth = 0,
}: GridListProps<T>) => {
  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const start = virtualRow.index * colCount;
        const rowItems = items.slice(start, start + colCount);

        return (
          <div
            key={virtualRow.index}
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
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {rowItems.map((material) => renderItem(material))}
          </div>
        );
      })}
    </div>
  );
};
