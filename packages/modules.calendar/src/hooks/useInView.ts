import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Intersection Observer: true, когда элемент попадает в видимую область (viewport).
 * Используется для отложенной загрузки данных (например кабинета по classroomId),
 * пока карточка реально не в зоне просмотра.
 */
export function useInView<T extends HTMLElement>() {
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((element: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!element) {
      setIsInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { root: null, threshold: 0 },
    );

    observer.observe(element);
    observerRef.current = observer;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { ref, isInView };
}
