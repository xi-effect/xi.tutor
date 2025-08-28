import type { Virtualizer } from '@tanstack/react-virtual';

type GridListProps<T> = {
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  colCount: number;
  gap: number;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

export const GridList = <T,>({
  rowVirtualizer,
  colCount,
  gap,
  items,
  renderItem,
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
              transform: `translateY(${virtualRow.start}px)`,
              display: 'grid',
              gap: gap,
              padding: gap,
              paddingLeft: 0,
              boxSizing: 'border-box',
              gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
            }}
          >
            {rowItems.map((material) => renderItem(material))}
          </div>
        );
      })}
    </div>
  );
};
