import type { UserFlagKey } from 'common.api';
import { isUserFlagContentVisible } from './userFlagCache';
import { useUserFlag } from './useUserFlag';

type UseDismissibleUserFlagOptions = {
  enabled?: boolean;
};

export const useDismissibleUserFlag = (
  key: UserFlagKey,
  options: UseDismissibleUserFlagOptions = {},
) => {
  const flag = useUserFlag(key, options);

  return {
    visible: isUserFlagContentVisible(flag.isSuccess, flag.value),
    dismiss: () => {
      flag.setValue(true);
    },
    isError: flag.isError,
    isLoading: flag.isLoading,
    isUpdating: flag.isUpdating,
  };
};
