import { useMemo } from 'react';
import { TAG_KIND, type TagSchema, tagsApiConfig, TagsQueryKey, tagsQueryKeys } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useQueries } from '@tanstack/react-query';

const fetchTagById = async (id: number): Promise<TagSchema> => {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = tagsApiConfig[TagsQueryKey.GetTagById];
  const response = await axiosInst<TagSchema>({
    method,
    url: getUrl(TAG_KIND.Generic, id),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const uniquePositiveIds = (ids: number[]): number[] => {
  const seen = new Set<number>();
  const next: number[] = [];
  for (const id of ids) {
    if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    next.push(id);
  }
  return next;
};

export const useTagsByIds = (ids: number[]) => {
  const idsKey = ids.join(',');
  const uniqueIds = useMemo(
    () => uniquePositiveIds(idsKey ? idsKey.split(',').map(Number) : []),
    [idsKey],
  );

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: tagsQueryKeys.byId(TAG_KIND.Generic, id),
      queryFn: () => fetchTagById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const dataRevision = queries.map((query) => `${query.dataUpdatedAt}:${query.status}`).join('|');
  const tags = useMemo(
    () =>
      uniqueIds.flatMap((_, index) => {
        const tag = queries[index]?.data;
        return tag ? [tag] : [];
      }),
    // queries is a new array each render; dataRevision tracks actual results
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see dataRevision
    [dataRevision, uniqueIds],
  );

  return {
    tags,
    isLoading: queries.some((query) => query.isLoading),
  };
};
