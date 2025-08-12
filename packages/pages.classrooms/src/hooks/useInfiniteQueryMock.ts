import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import { RefObject } from 'react';
import { ClassroomPropsT } from '../types';
import { classroomsMock } from '../mocks';
import React from 'react';

export const useInfiniteQueryMock = (parentRef: RefObject<HTMLDivElement | null>) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTanStackInfiniteQuery({
      queryKey: ['classrooms-mock'],
      queryFn: async ({ pageParam = 0 }) => {
        // Имитация задержки сети
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const pageSize = 12;
        const startIndex = pageParam * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = classroomsMock.slice(startIndex, endIndex);

        return pageData;
      },
      initialPageParam: 0,
      getNextPageParam: (_, allPages) => {
        const totalPages = Math.ceil(classroomsMock.length / 12);
        const nextPage = allPages.length;

        if (nextPage < totalPages) {
          return nextPage;
        }
        return undefined;
      },
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут
    });

  // Обработчик скролла для автоматической загрузки следующей страницы
  React.useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current || isFetchingNextPage || !hasNextPage) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceToBottom < 100) {
        fetchNextPage();
      }
    };

    const el = parentRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [parentRef, fetchNextPage, isFetchingNextPage, hasNextPage]);

  // Объединяем все страницы в один массив
  const items: ClassroomPropsT[] = React.useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const flattened = data.pages.flat();
    return flattened;
  }, [data?.pages]);

  return {
    items,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
  };
};
