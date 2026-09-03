import { useMemo } from 'react';
import { TAG_KIND, type TagSchema, tagsQueryKeys } from 'common.api';
import { useQueries } from '@tanstack/react-query';
import { useCurrentUser } from '../user';
import { getGenericTag } from './useGenericTags';
import { useGenericTags } from './useGenericTags';
import { resolveTagsByIds } from './genericTags';

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
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const catalog = useGenericTags({ enabled: isTutor });

  const idsKey = ids.join(',');
  const uniqueIds = useMemo(
    () => uniquePositiveIds(idsKey ? idsKey.split(',').map(Number) : []),
    [idsKey],
  );

  const fromCatalog = useMemo(
    () => (isTutor ? resolveTagsByIds(catalog.tags, uniqueIds) : []),
    [catalog.tags, isTutor, uniqueIds],
  );

  const studentQueries = useQueries({
    queries: isTutor
      ? []
      : uniqueIds.map((id) => ({
          queryKey: tagsQueryKeys.byId(TAG_KIND.Generic, id),
          queryFn: () => getGenericTag(id),
          staleTime: 5 * 60 * 1000,
        })),
  });

  const dataRevision = studentQueries
    .map((query) => `${query.dataUpdatedAt}:${query.status}`)
    .join('|');
  const studentTags = useMemo(
    () =>
      uniqueIds.flatMap((_, index) => {
        const tag = studentQueries[index]?.data;
        return tag ? [tag] : [];
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dataRevision tracks results
    [dataRevision, uniqueIds],
  );

  const tags: TagSchema[] = isTutor ? fromCatalog : studentTags;

  return {
    tags,
    isLoading: isTutor ? catalog.isLoading : studentQueries.some((query) => query.isLoading),
  };
};
