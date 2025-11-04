import type { Virtualizer } from '@tanstack/react-virtual';

type VirtualListProps<T> = {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
};

/**
 * Виртуализированный список уведомлений
 * По аналогии с GridList из materials, но для вертикального списка
 */
export const VirtualList = <T,>({
  virtualizer,
  items,
  renderItem,
  className,
}: VirtualListProps<T>) => {
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      className={className}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualItems.map((virtualItem) => {
        const item = items[virtualItem.index];

        if (!item) {
          return null;
        }

        return (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={(el) => {
              if (el) {
                virtualizer.measureElement(el);
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(item)}
          </div>
        );
      })}
    </div>
  );
};
