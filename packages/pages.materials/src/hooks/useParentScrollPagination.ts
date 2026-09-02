import { type RefObject, useEffect } from 'react';

type UseParentScrollPaginationParams = {
  parentRef: RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  itemsCount: number;
};

const DISTANCE_TO_BOTTOM_PX = 120;

export const useParentScrollPagination = ({
  parentRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  itemsCount,
}: UseParentScrollPaginationParams) => {
  useEffect(() => {
    const element = parentRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const maybeLoad = () => {
      if (element.scrollHeight - element.scrollTop - element.clientHeight < DISTANCE_TO_BOTTOM_PX) {
        fetchNextPage();
      }
    };

    maybeLoad();
    element.addEventListener('scroll', maybeLoad);
    window.addEventListener('resize', maybeLoad);

    return () => {
      element.removeEventListener('scroll', maybeLoad);
      window.removeEventListener('resize', maybeLoad);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, itemsCount, parentRef]);
};
