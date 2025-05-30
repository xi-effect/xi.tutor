import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useEffect, useState } from 'react';
import { materialsMock } from '../mocks';
import { Card } from './Card';

export const CardsGrid = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(materialsMock);

  /* ===== 1. Responsive-состояние ===== */
  const ITEM_WIDTH = 280; // ширина карточки + gap
  const GAP = 16; // gap между карточками
  const MAX_COLUMNS = 4; // максимальное количество колонок
  const [colCount, setColCount] = useState(1);
  const [rowHeight, setRowHeight] = useState(188);

  // Измеряем высоту карточки
  useEffect(() => {
    const cardElement = parentRef.current?.querySelector('.card-item');
    if (!cardElement) return;

    const ro = new ResizeObserver(([entry]) => {
      const { height } = entry.contentRect;
      setRowHeight(height + GAP); // добавляем gap к высоте
    });
    ro.observe(cardElement);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      // Ограничиваем количество колонок от 1 до MAX_COLUMNS
      const cols = Math.min(
        MAX_COLUMNS,
        Math.max(1, Math.floor((width + GAP) / (ITEM_WIDTH + GAP))),
      );
      setColCount(cols);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ===== 2. Подгрузка данных ===== */
  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        setItems((prev) => [...prev, ...materialsMock]);
      }
    };

    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  /* ===== 3. Виртуализация «строк» ===== */
  const rowCount = Math.ceil(items.length / colCount);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[calc(100vh-200px)] overflow-auto">
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
              {rowItems.map((material) => (
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
