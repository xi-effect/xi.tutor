import {
  ClassroomsQueryKey,
  subscriptionQueryKeys,
  UserQueryKey,
  type ClassroomT,
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

const isClassroom = (value: unknown): value is ClassroomT => {
  if (!value || typeof value !== 'object') return false;
  const item = value as { id?: unknown; status?: unknown };
  return typeof item.id === 'number' && typeof item.status === 'string';
};

const readClassroomList = (data: unknown): ClassroomT[] | null => {
  if (Array.isArray(data)) {
    return data.filter(isClassroom);
  }

  if (!data || typeof data !== 'object' || !('pages' in data)) {
    return null;
  }

  const pages = (data as { pages?: unknown }).pages;
  if (!Array.isArray(pages)) return null;

  return pages.flatMap((page) => (Array.isArray(page) ? page.filter(isClassroom) : []));
};

export const countCachedActiveClassrooms = (): number | null => {
  const entries = queryClient.getQueriesData({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
  const seen = new Set<number>();
  let sawList = false;
  let active = 0;

  for (const [, data] of entries) {
    const list = readClassroomList(data);
    if (!list) continue;
    sawList = true;

    for (const classroom of list) {
      if (seen.has(classroom.id)) continue;
      seen.add(classroom.id);
      if (classroom.status === 'active') active += 1;
    }
  }

  return sawList ? active : null;
};
