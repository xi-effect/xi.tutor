import {
  classroomsQueryKeys,
  normalizeClassroomsSearchLimit,
  type ClassroomStatusT,
  type ClassroomT,
} from 'common.api';
import { useQuery } from '@tanstack/react-query';
import {
  mergeMonetizationClassrooms,
  useMonetizationDevStore,
} from '../subscription/monetizationDevtools';
import { searchTutorClassrooms } from './searchTutorClassrooms';

const DEFAULT_LIMIT = 20;

export const useFetchClassrooms = (
  searchParams?: {
    limit?: number;
    statuses?: ClassroomStatusT[];
  },
  disabled?: boolean,
) => {
  const catalog = useMonetizationDevStore((state) => state.override.classroomCatalog);
  const limit = normalizeClassroomsSearchLimit(searchParams?.limit ?? DEFAULT_LIMIT);
  const statuses = searchParams?.statuses;

  const { data, isError, isLoading, ...rest } = useQuery({
    queryKey: classroomsQueryKeys.list(limit, statuses),
    queryFn: () => searchTutorClassrooms(null, limit, { statuses }),
    enabled: !disabled,
  });

  return {
    data: catalog
      ? mergeMonetizationClassrooms((data as ClassroomT[] | undefined) ?? [], catalog, statuses)
      : (data as ClassroomT[] | undefined),
    isError: catalog ? false : isError,
    isLoading: catalog ? false : isLoading,
    ...rest,
  };
};
