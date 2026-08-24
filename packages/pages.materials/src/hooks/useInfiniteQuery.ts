import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import { RefObject } from 'react';
import { MaterialPropsT } from '../types';
import { MaterialsKindT } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import React from 'react';
import {
  buildAnyMaterialFilters,
  PERSONAL_MATERIAL_SCOPE,
  serializeMaterialScope,
} from 'common.services';

export const useInfiniteQuery = (
  parentRef: RefObject<HTMLDivElement | null>,
  kind: MaterialsKindT,
) => {
  const filters = buildAnyMaterialFilters({
    content_kind: kind,
    scope: PERSONAL_MATERIAL_SCOPE,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTanStackInfiniteQuery({
      queryKey: [MaterialsQueryKey.Materials, kind, serializeMaterialScope(filters.scope)],
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
                  updated_at: pageParam,
                }
              : null,
            filters,
          },
        });

        return response.data;
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        const pageData = Array.isArray(lastPage) ? lastPage : lastPage?.data || lastPage?.results;

        if (!pageData || !Array.isArray(pageData) || pageData.length === 0) {
          return undefined;
        }

        const lastItem = pageData[pageData.length - 1];
        if (!lastItem || !lastItem.updated_at) {
          return undefined;
        }

        return lastItem.updated_at;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

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

  const items: MaterialPropsT[] = React.useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const flattened = data.pages.flatMap((page) => {
      if (Array.isArray(page)) {
        return page;
      }
      return page?.data || page?.results || [];
    });

    const seen = new Set<string>();
    return flattened.filter((item: MaterialPropsT) => {
      if (!item?.id || seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
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
