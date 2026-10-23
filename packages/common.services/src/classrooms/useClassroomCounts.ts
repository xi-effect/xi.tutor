import { useQuery, type QueryClient } from '@tanstack/react-query';
import {
  classroomsApiConfig,
  ClassroomsQueryKey,
  classroomsQueryKeys,
  parseClassroomCounts,
  type ClassroomCounts,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import {
  overlayMonetizationQuery,
  resolveMonetizationClassroomCounts,
  useMonetizationDevStore,
} from '../subscription/monetizationDevtools';
import { useTutorBillingScope } from '../subscription/useTutorBillingScope';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export async function getClassroomCounts(): Promise<ClassroomCounts> {
  const axiosInst = await getAxiosInstance();
  const countsConfig = classroomsApiConfig[ClassroomsQueryKey.ClassroomCounts];
  const response = await axiosInst({
    method: countsConfig.method,
    url: countsConfig.getUrl(),
    headers: jsonHeaders,
  });

  return parseClassroomCounts(response.data);
}

export const invalidateClassroomCounts = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.ClassroomCounts] });

export const useClassroomCounts = (options?: { enabled?: boolean }) => {
  const { userId, enabled } = useTutorBillingScope(options?.enabled ?? true);
  const override = useMonetizationDevStore((state) => state.override);
  const query = useQuery({
    queryKey:
      userId === null
        ? (['classroomCounts', 'anonymous'] as const)
        : classroomsQueryKeys.classroomCounts(userId),
    queryFn: getClassroomCounts,
    enabled,
  });
  const counts = resolveMonetizationClassroomCounts(query.data, override);
  if (!counts || counts === query.data) return query;

  return overlayMonetizationQuery(query, counts, true);
};
