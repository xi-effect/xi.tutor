import { useQuery } from '@tanstack/react-query';
import { userFlagsQueryKeys, type UserFlagKey } from 'common.api';
import { useCurrentUser } from '../user';
import { getCurrentUserFlag } from './getCurrentUserFlag';
import { useUpdateUserFlag } from './useUpdateUserFlag';

type UseUserFlagOptions = {
  enabled?: boolean;
};

export const useUserFlag = (key: UserFlagKey, options: UseUserFlagOptions = {}) => {
  const { data: user } = useCurrentUser();
  const userId = user?.id;
  const { updateUserFlag } = useUpdateUserFlag();

  const enabled = typeof userId === 'number' && (options.enabled ?? true);

  const query = useQuery({
    queryKey: userFlagsQueryKeys.current(typeof userId === 'number' ? userId : null, key),
    queryFn: async () => {
      try {
        return await getCurrentUserFlag(key);
      } catch (error) {
        console.error('Ошибка при получении UserFlag:', key, error);
        throw error;
      }
    },
    enabled,
  });

  const setValue = (value: boolean) => {
    updateUserFlag.mutate({ key, value });
  };

  return {
    ...query,
    value: query.data,
    setValue,
    isUpdating: updateUserFlag.isPending,
  };
};
