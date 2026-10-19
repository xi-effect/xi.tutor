import { useEffect, useMemo } from 'react';
import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import {
  classroomsQueryKeys,
  getClassroomDisplayName,
  getNextClassroomsCursor,
  type ClassroomCursor,
  type ClassroomStatusT,
} from 'common.api';
import { searchTutorClassrooms } from './searchTutorClassrooms';

const PAGE_SIZE = 50;

export const useAllTutorClassrooms = (enabled = true, statuses?: ClassroomStatusT[]) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useTanStackInfiniteQuery({
      queryKey: classroomsQueryKeys.search(PAGE_SIZE, statuses),
      queryFn: async ({ pageParam }) =>
        searchTutorClassrooms((pageParam as ClassroomCursor | undefined) ?? null, PAGE_SIZE, {
          statuses,
        }),
      initialPageParam: undefined as ClassroomCursor | undefined,
      getNextPageParam: (lastPage) => getNextClassroomsCursor(lastPage, PAGE_SIZE),
      enabled,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

  useEffect(() => {
    if (!enabled || !hasNextPage || isFetchingNextPage || isError) {
      return;
    }

    void fetchNextPage();
  }, [enabled, fetchNextPage, hasNextPage, isFetchingNextPage, isError]);

  const classrooms = useMemo(() => {
    const flattened = data?.pages.flat() ?? [];
    const seen = new Set<number>();

    return flattened
      .filter((classroom) => {
        if (!classroom?.id || seen.has(classroom.id)) {
          return false;
        }
        seen.add(classroom.id);
        return true;
      })
      .sort((a, b) =>
        getClassroomDisplayName(a).localeCompare(getClassroomDisplayName(b), 'ru', {
          sensitivity: 'base',
        }),
      );
  }, [data?.pages]);

  return {
    classrooms,
    isLoading: isLoading || isFetchingNextPage || Boolean(hasNextPage),
    isError,
  };
};
