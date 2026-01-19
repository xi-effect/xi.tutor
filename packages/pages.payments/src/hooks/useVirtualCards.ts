import { RefObject, useLayoutEffect, useState, useCallback } from 'react';
import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';

export const useVirtualCards = <T>(
  parentRef: RefObject<HTMLDivElement | null>,
  items: T[],
  estimatedCardHeight = 182,
  overscan = 8,
) => {
  const [cardHeights, setCardHeights] = useState<Record<number, number>>({});

  const virtualizer: Virtualizer<HTMLDivElement, Element> = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => cardHeights[index] ?? estimatedCardHeight,
    overscan,
  });

  const measureCard = useCallback((index: number, el: HTMLDivElement | null) => {
    if (!el) return;

    const height = el.getBoundingClientRect().height;

    setCardHeights((prev) => {
      if (prev[index] === height) return prev;
      return { ...prev, [index]: height };
    });
  }, []);

  useLayoutEffect(() => {
    if (Object.keys(cardHeights).length > 0) {
      virtualizer.measure();
    }
  }, [cardHeights, virtualizer]);

  return { virtualizer, measureCard };
};
