import { RefObject, useEffect, useRef } from 'react';

type UseScrollPaginationParams = {
  sentinelRef: RefObject<HTMLDivElement | null>;
  rootRef?: RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  itemsCount: number;
};

export const useScrollPagination = ({
  sentinelRef,
  rootRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  itemsCount,
}: UseScrollPaginationParams) => {
  const isFetchingRef = useRef(isFetchingNextPage);
  const fetchNextPageRef = useRef(fetchNextPage);

  useEffect(() => {
    isFetchingRef.current = isFetchingNextPage;
  }, [isFetchingNextPage]);

  useEffect(() => {
    fetchNextPageRef.current = fetchNextPage;
  }, [fetchNextPage]);

  useEffect(() => {
    if (!hasNextPage || itemsCount === 0) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingRef.current) {
          fetchNextPageRef.current();
        }
      },
      { root: rootRef?.current ?? null, rootMargin: '120px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef, rootRef, hasNextPage, itemsCount]);
};
