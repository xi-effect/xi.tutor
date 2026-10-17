import {
  classroomsQueryKeys,
  subscriptionQueryKeys,
  UserQueryKey,
  type ClassroomCounts,
  type CurrentPlan,
  type StorageUsage,
} from 'common.api';
import { queryClient } from 'common.config';
import { getTariff, type PlanId, type TariffLimits } from './tariffs';

type HomeUser = {
  id?: number;
};

const readHomeUserId = (): number | null => {
  const user = queryClient.getQueryData<HomeUser>([UserQueryKey.Home]);
  return typeof user?.id === 'number' ? user.id : null;
};

export const readCachedCurrentPlan = (): CurrentPlan | undefined => {
  const userId = readHomeUserId();
  if (userId === null) return undefined;
  return queryClient.getQueryData<CurrentPlan>(subscriptionQueryKeys.currentPlan(userId));
};

export const readCachedStorageUsage = (): StorageUsage | undefined => {
  const userId = readHomeUserId();
  if (userId === null) return undefined;
  return queryClient.getQueryData<StorageUsage>(subscriptionQueryKeys.storageUsage(userId));
};

export const planKindToPlanId = (kind: CurrentPlan['kind']): PlanId =>
  kind === 'pro' ? 'pro' : 'basic';

export const mergePlanLimits = (plan: CurrentPlan): TariffLimits => {
  const planId = planKindToPlanId(plan.kind);

  return {
    ...getTariff(planId),
    maxActiveClassrooms: plan.max_active_classrooms,
    storageBytes: plan.max_total_storage_bytes,
  };
};

export const readCachedPlanId = (): PlanId | null => {
  const plan = readCachedCurrentPlan();
  if (!plan) return null;
  return planKindToPlanId(plan.kind);
};

export const countCachedActiveClassrooms = (): number | null => {
  const userId = readHomeUserId();
  if (userId === null) return null;

  const counts = queryClient.getQueryData<ClassroomCounts>(
    classroomsQueryKeys.classroomCounts(userId),
  );
  return typeof counts?.active === 'number' && Number.isFinite(counts.active)
    ? counts.active
    : null;
};
