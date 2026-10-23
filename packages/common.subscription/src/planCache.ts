import {
  classroomsQueryKeys,
  subscriptionQueryKeys,
  UserQueryKey,
  type ClassroomCounts,
  type CurrentPlan,
  type StorageUsage,
} from 'common.api';
import { queryClient } from 'common.config';
import {
  getMonetizationOverride,
  resolveMonetizationClassroomCounts,
  resolveMonetizationPlan,
  resolveMonetizationStorage,
} from 'common.services';
import { getTariff, type PlanId, type TariffLimits } from './tariffs';

type HomeUser = {
  id?: number;
  default_layout?: string;
};

const readHomeUser = (): HomeUser | undefined =>
  queryClient.getQueryData<HomeUser>([UserQueryKey.Home]);

export const isCurrentUserTutor = (): boolean => readHomeUser()?.default_layout === 'tutor';

/** Биллинг относится только к роли репетитора: после переключения на ученика его кэш не применяется. */
const readHomeUserId = (): number | null => {
  const user = readHomeUser();
  if (user?.default_layout !== 'tutor') return null;
  return typeof user.id === 'number' ? user.id : null;
};

const readRawCurrentPlan = (): CurrentPlan | undefined => {
  const userId = readHomeUserId();
  if (userId === null) return undefined;
  return queryClient.getQueryData<CurrentPlan>(subscriptionQueryKeys.currentPlan(userId));
};

const readRawStorageUsage = (): StorageUsage | undefined => {
  const userId = readHomeUserId();
  if (userId === null) return undefined;
  return queryClient.getQueryData<StorageUsage>(subscriptionQueryKeys.storageUsage(userId));
};

const readRawClassroomCounts = (): ClassroomCounts | undefined => {
  const userId = readHomeUserId();
  if (userId === null) return undefined;
  return queryClient.getQueryData<ClassroomCounts>(classroomsQueryKeys.classroomCounts(userId));
};

export const readCachedCurrentPlan = (): CurrentPlan | undefined =>
  resolveMonetizationPlan(readRawCurrentPlan(), getMonetizationOverride());

export const readCachedStorageUsage = (): StorageUsage | undefined =>
  resolveMonetizationStorage(readRawStorageUsage(), getMonetizationOverride());

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
  const counts = resolveMonetizationClassroomCounts(
    readRawClassroomCounts(),
    getMonetizationOverride(),
  );
  return typeof counts?.active === 'number' && Number.isFinite(counts.active)
    ? counts.active
    : null;
};
