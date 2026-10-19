import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserFlagKey } from 'common.api';
import { useCurrentUser } from '../user';
import { updateCurrentUserFlag } from './updateCurrentUserFlag';
import {
  applyUserFlagOptimisticUpdate,
  rollbackUserFlagUpdate,
  setUserFlagQueryData,
  toUserFlagQueryKey,
  type UserFlagQueryKey,
} from './userFlagCache';

export type UpdateUserFlagVars = {
  key: UserFlagKey;
  value: boolean;
};

type UpdateUserFlagContext = {
  queryKey: UserFlagQueryKey;
  previousValue: boolean | undefined;
};

export const useUpdateUserFlag = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userId = user?.id;

  const mutation = useMutation<boolean, Error, UpdateUserFlagVars, UpdateUserFlagContext>({
    mutationFn: ({ key, value }) => updateCurrentUserFlag(key, value),
    onMutate: async ({ key, value }) => {
      if (typeof userId !== 'number') {
        return undefined;
      }

      const queryKey = toUserFlagQueryKey(userId, key);
      const previousValue = await applyUserFlagOptimisticUpdate(queryClient, queryKey, value);
      return { queryKey, previousValue };
    },
    onError: (error, _vars, context) => {
      if (context) {
        rollbackUserFlagUpdate(queryClient, context.queryKey, context.previousValue);
      }

      console.error('Ошибка при обновлении UserFlag:', error);
    },
    onSuccess: (value, _vars, context) => {
      if (!context) {
        return;
      }

      setUserFlagQueryData(queryClient, context.queryKey, value);
    },
  });

  return {
    updateUserFlag: mutation,
  };
};
