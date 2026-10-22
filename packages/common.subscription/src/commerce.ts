import { UserQueryKey } from 'common.api';
import { queryClient } from 'common.config';

/** Временный доступ к покупке подписки и активации промокодов. */
export const SUBSCRIPTION_COMMERCE_USER_IDS = [1, 30, 3701, 8663, 8667] as const;

const subscriptionCommerceUserIds = new Set<number>(SUBSCRIPTION_COMMERCE_USER_IDS);

type HomeUser = {
  id?: number;
};

export const canUseSubscriptionCommerce = (userId: number | null | undefined): boolean =>
  typeof userId === 'number' && subscriptionCommerceUserIds.has(userId);

export const canCurrentUserUseSubscriptionCommerce = (): boolean => {
  const user = queryClient.getQueryData<HomeUser>([UserQueryKey.Home]);
  return canUseSubscriptionCommerce(user?.id);
};
