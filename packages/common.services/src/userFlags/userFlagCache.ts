import { userFlagsQueryKeys, type UserFlagKey } from 'common.api';
import type { QueryClient } from '@tanstack/react-query';

export type UserFlagQueryKey = ReturnType<typeof userFlagsQueryKeys.current>;

export const isUserFlagContentVisible = (isSuccess: boolean, value: boolean | undefined): boolean =>
  isSuccess && value === false;

export async function applyUserFlagOptimisticUpdate(
  queryClient: QueryClient,
  queryKey: UserFlagQueryKey,
  value: boolean,
): Promise<boolean | undefined> {
  await queryClient.cancelQueries({ queryKey, exact: true });
  const previousValue = queryClient.getQueryData<boolean>(queryKey);
  queryClient.setQueryData<boolean>(queryKey, value);
  return previousValue;
}

export function rollbackUserFlagUpdate(
  queryClient: QueryClient,
  queryKey: UserFlagQueryKey,
  previousValue: boolean | undefined,
): void {
  if (previousValue === undefined) {
    queryClient.removeQueries({ queryKey, exact: true });
    return;
  }

  queryClient.setQueryData<boolean>(queryKey, previousValue);
}

export function setUserFlagQueryData(
  queryClient: QueryClient,
  queryKey: UserFlagQueryKey,
  value: boolean,
): void {
  queryClient.setQueryData<boolean>(queryKey, value);
}

export const toUserFlagQueryKey = (userId: number, key: UserFlagKey): UserFlagQueryKey =>
  userFlagsQueryKeys.current(userId, key);
