import { useQuery, type QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  classroomsApiConfig,
  ClassroomsQueryKey,
  classroomsQueryKeys,
  parseClassroomCounts,
  type ClassroomCounts,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useTutorBillingScope } from '../subscription/useTutorBillingScope';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const readActiveClassroomsCount = (data: unknown): number => {
  if (typeof data !== 'number' || !Number.isInteger(data) || data < 0) {
    throw new Error('Invalid ActiveClassroomsCount');
  }

  return data;
};

export async function getClassroomCounts(): Promise<ClassroomCounts> {
  const axiosInst = await getAxiosInstance();
  const countsConfig = classroomsApiConfig[ClassroomsQueryKey.ClassroomCounts];

  try {
    const response = await axiosInst({
      method: countsConfig.method,
      url: countsConfig.getUrl(),
      headers: jsonHeaders,
    });

    return parseClassroomCounts(response.data);
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 404) {
      throw error;
    }
  }

  const legacyConfig = classroomsApiConfig[ClassroomsQueryKey.ActiveClassroomsCount];
  const response = await axiosInst({
    method: legacyConfig.method,
    url: legacyConfig.getUrl(),
    headers: jsonHeaders,
  });

  return {
    active: readActiveClassroomsCount(response.data),
    locked: 0,
  };
}

export const invalidateClassroomCounts = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.ClassroomCounts] });

export const useClassroomCounts = (options?: { enabled?: boolean }) => {
  const { userId, enabled } = useTutorBillingScope(options?.enabled ?? true);

  return useQuery({
    queryKey:
      userId === null
        ? (['classroomCounts', 'anonymous'] as const)
        : classroomsQueryKeys.classroomCounts(userId),
    queryFn: getClassroomCounts,
    enabled,
  });
};
