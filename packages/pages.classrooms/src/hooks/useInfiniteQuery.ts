import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import {
  classroomsQueryKeys,
  getClassroomDisplayName,
  getNextClassroomsCursor,
  serializeClassroomStatuses,
  type ClassroomCursor,
  type ClassroomStatusT,
  type ClassroomT,
} from 'common.api';
import {
  mergeMonetizationClassrooms,
  searchTutorClassrooms,
  useMonetizationDevStore,
} from 'common.services';
import React from 'react';
import { ClassroomPropsT } from '../types';

const PAGE_SIZE = 25;

const adaptClassroom = (classroom: ClassroomT): ClassroomPropsT => ({
  id: classroom.id,
  name: getClassroomDisplayName(classroom),
  status: classroom.status,
  kind: classroom.kind,
  description: classroom.description || undefined,
  created_at: classroom.created_at,
  student_id: 'student_id' in classroom ? classroom.student_id : undefined,
  subject_id: classroom.subject_id,
});

export const useInfiniteQuery = (statuses: readonly ClassroomStatusT[] = []) => {
  const catalog = useMonetizationDevStore((state) => state.override.classroomCatalog);
  const statusKey = serializeClassroomStatuses(statuses);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTanStackInfiniteQuery({
      queryKey: classroomsQueryKeys.search(PAGE_SIZE, statuses),
      queryFn: async ({ pageParam }) =>
        searchTutorClassrooms((pageParam as ClassroomCursor | undefined) ?? null, PAGE_SIZE, {
          statuses,
        }),
      initialPageParam: undefined as ClassroomCursor | undefined,
      getNextPageParam: (lastPage) => getNextClassroomsCursor(lastPage, PAGE_SIZE),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

  const items: ClassroomPropsT[] = React.useMemo(() => {
    if (!catalog && !data?.pages) {
      return [];
    }

    const allowed = statusKey ? (statusKey.split(',') as ClassroomStatusT[]) : undefined;
    const source = mergeMonetizationClassrooms(data?.pages.flat() ?? [], catalog, allowed);
    const seen = new Set<number>();

    return source.flatMap((classroom) => {
      if (!classroom?.id || seen.has(classroom.id)) {
        return [];
      }

      seen.add(classroom.id);
      return [adaptClassroom(classroom)];
    });
  }, [catalog, data?.pages, statusKey]);

  return {
    items,
    isLoading: catalog ? false : isLoading,
    isError: catalog ? false : isError,
    error,
    isFetchingNextPage: catalog ? false : isFetchingNextPage,
    hasNextPage: catalog ? false : hasNextPage,
    fetchNextPage,
  };
};
