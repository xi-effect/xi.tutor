/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react';
import { Card } from './Card';
import { useResponsiveGrid, useInfiniteScroll, useVirtualGrid } from '../../hooks';

export const Notes = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  const { colCount, rowHeight, GAP } = useResponsiveGrid(parentRef);
  const items = useInfiniteScroll(parentRef);
  const rowVirtualizer = useVirtualGrid(parentRef, items, colCount, rowHeight);

  return (
    <div ref={parentRef} className="h-[calc(100vh-158px)] overflow-auto">
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
                gap: GAP,
                padding: GAP,
                paddingLeft: 0,
                boxSizing: 'border-box',
                gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
              }}
            >
              {rowItems.map((material: any) => (
                <div key={material.idMaterial} className="card-item">
                  <Card {...material} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
