import { useQuery, type QueryClient } from '@tanstack/react-query';
import {
  classroomsApiConfig,
  ClassroomsQueryKey,
  classroomsQueryKeys,
  parseActiveClassroomsCount,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useTutorBillingScope } from '../subscription/useTutorBillingScope';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export async function getActiveClassroomsCount(): Promise<number> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = classroomsApiConfig[ClassroomsQueryKey.ActiveClassroomsCount];

  const response = await axiosInst({
    method,
    url: getUrl(),
    headers: jsonHeaders,
  });

  return parseActiveClassroomsCount(response.data);
}

export const invalidateActiveClassroomsCount = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.ActiveClassroomsCount] });

export const useActiveClassroomsCount = (options?: { enabled?: boolean }) => {
  const { userId, enabled } = useTutorBillingScope(options?.enabled ?? true);

  return useQuery({
    queryKey:
      userId === null
        ? (['activeClassroomsCount', 'anonymous'] as const)
        : classroomsQueryKeys.activeClassroomsCount(userId),
    queryFn: getActiveClassroomsCount,
    enabled,
  });
};
