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
      // pageParam - это значение, которое возвращает getNextPageParam из предыдущей страницы
      // При первой загрузке pageParam = undefined (initialPageParam)
      queryFn: async ({ pageParam }) => {
        const axiosInst = await getAxiosInstance();
        const url = materialsApiConfig[MaterialsQueryKey.Materials].getUrl();

        const response = await axiosInst({
          method: materialsApiConfig[MaterialsQueryKey.Materials].method,
          url,
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            limit: 40,
            cursor: pageParam
              ? {
                  created_at: pageParam,
                }
              : null,
            filters: {
              content_type: kind,
            },
          },
        });

        return response.data;
      },
      // Начальное значение для первой страницы
      initialPageParam: undefined as string | undefined,
      // Эта функция определяет параметр для следующей страницы
      // Возвращаемое значение станет pageParam для следующего запроса
      getNextPageParam: (lastPage) => {
        // Проверяем, если lastPage это объект с массивом данных
        const data = Array.isArray(lastPage) ? lastPage : lastPage?.data || lastPage?.results;

        if (!data || !Array.isArray(data) || data.length === 0) {
          return undefined; // Больше страниц нет
        }

        const lastItem = data[data.length - 1];
        // Используем created_at для консистентности с запросом
        if (!lastItem || !lastItem.created_at) {
          return undefined; // Больше страниц нет
        }

        // Возвращаем created_at последнего элемента - это будет pageParam для следующего запроса
        return lastItem.created_at;
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
