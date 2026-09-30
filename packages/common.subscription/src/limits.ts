import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import { canUseFeature, type SubscriptionFeatureId } from './features';
import {
  countCachedActiveClassrooms,
  mergePlanLimits,
  planKindToPlanId,
  readCachedCurrentPlan,
  readCachedStorageUsage,
} from './planCache';
import { useSubscriptionStore } from './store';
import { getTariff, type PlanId, type TariffLimits } from './tariffs';
import { requestClassroomLimitDialog, requestStorageLimitDialog } from './uiStore';

export type UploadKind = 'image' | 'other';

export type UploadEvaluation =
  | { ok: true }
  | {
      ok: false;
      reason: 'storage' | 'size';
      planId: PlanId;
      maxBytes: number;
      kind: UploadKind;
    };

export const getCurrentTariff = (planId?: PlanId): TariffLimits => {
  const cached = readCachedCurrentPlan();

  if (planId) {
    if (cached && planKindToPlanId(cached.kind) === planId) {
      return mergePlanLimits(cached);
    }
    return getTariff(planId);
  }

  if (cached) return mergePlanLimits(cached);
  return getTariff('basic');
};

export const getMaxImageBytes = (): number => getCurrentTariff().maxImageBytes;

export const getMaxFileBytes = (): number => getCurrentTariff().maxFileBytes;

export const getBoardElementsLimit = (): number => getCurrentTariff().maxBoardElements;

export const getBoardElementsWarningThreshold = (): number =>
  Math.floor(getBoardElementsLimit() * 0.75);

export const canCreateClassroom = (): boolean => {
  if (!SUBSCRIPTION_BILLING_ENABLED) return true;

  const plan = readCachedCurrentPlan();
  if (!plan) return true;

  const used = countCachedActiveClassrooms();
  if (used === null) return true;

  return used < plan.max_active_classrooms;
};

export const isStorageQuotaReached = (): boolean => {
  if (!SUBSCRIPTION_BILLING_ENABLED) return false;

  const plan = readCachedCurrentPlan();
  const usage = readCachedStorageUsage();
  if (!plan || !usage) return false;

  return usage.total_storage_bytes >= plan.max_total_storage_bytes;
};

export const isBoardElementsLimitReached = (currentCount: number): boolean => {
  const atLimitByCount = currentCount >= getCurrentTariff().maxBoardElements;
  if (!SUBSCRIPTION_BILLING_ENABLED) return atLimitByCount;
  return useSubscriptionStore.getState().mock.boardAtLimit || atLimitByCount;
};

export const getMaxBytesForKind = (kind: UploadKind): number =>
  kind === 'image' ? getMaxImageBytes() : getMaxFileBytes();

export const evaluateUpload = (file: File, kind: UploadKind): UploadEvaluation => {
  const tariff = getCurrentTariff();
  const maxBytes = kind === 'image' ? tariff.maxImageBytes : tariff.maxFileBytes;

  if (SUBSCRIPTION_BILLING_ENABLED && isStorageQuotaReached()) {
    return { ok: false, reason: 'storage', planId: tariff.id, maxBytes, kind };
  }

  if (
    (SUBSCRIPTION_BILLING_ENABLED && useSubscriptionStore.getState().mock.forceOversizedFile) ||
    file.size > maxBytes
  ) {
    return { ok: false, reason: 'size', planId: tariff.id, maxBytes, kind };
  }

  return { ok: true };
};

export const tryStartClassroomCreate = (): boolean => {
  if (!canCreateClassroom()) {
    requestClassroomLimitDialog();
    return false;
  }
  return true;
};

export const tryStartUpload = (file: File, kind: UploadKind): UploadEvaluation => {
  const result = evaluateUpload(file, kind);
  if (!result.ok && result.reason === 'storage') {
    requestStorageLimitDialog();
  }
  return result;
};

export const canAccessFeature = (featureId: SubscriptionFeatureId): boolean =>
  canUseFeature(featureId);
