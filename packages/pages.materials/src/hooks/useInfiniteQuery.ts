import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import { RefObject } from 'react';
import { MaterialPropsT } from '../types';
import { MaterialsKindT } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import React from 'react';

export const useInfiniteQuery = (
  parentRef: RefObject<HTMLDivElement | null>,
  kind: MaterialsKindT,
) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTanStackInfiniteQuery({
      queryKey: [MaterialsQueryKey.Materials, kind],
      queryFn: async ({ pageParam }) => {
        const axiosInst = await getAxiosInstance();
        const url = materialsApiConfig[MaterialsQueryKey.Materials].getUrl(40, kind, pageParam);

        const response = await axiosInst({
          method: materialsApiConfig[MaterialsQueryKey.Materials].method,
          url,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data;
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        // Проверяем, если lastPage это объект с массивом данных
        const data = Array.isArray(lastPage) ? lastPage : lastPage?.data || lastPage?.results;

        if (!data || !Array.isArray(data) || data.length === 0) {
          return undefined;
        }

        const lastItem = data[data.length - 1];
        if (!lastItem || !lastItem.last_opened_at) {
          return undefined;
        }

        return lastItem.last_opened_at;
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
  const items: MaterialPropsT[] = React.useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const flattened = data.pages.flatMap((page) => {
      // Если страница это массив, возвращаем как есть
      if (Array.isArray(page)) {
        return page;
      }
      // Если страница это объект с массивом данных, извлекаем массив
      return page?.data || page?.results || [];
    });

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
