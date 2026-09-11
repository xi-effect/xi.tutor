import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import { canUseFeature, type SubscriptionFeatureId } from './features';
import { getTariff, type PlanId, type TariffLimits } from './tariffs';
import { useSubscriptionStore } from './store';
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

export const getCurrentTariff = (planId?: PlanId): TariffLimits =>
  getTariff(planId ?? useSubscriptionStore.getState().planId);

export const getMaxImageBytes = (): number => getCurrentTariff().maxImageBytes;

export const getMaxFileBytes = (): number => getCurrentTariff().maxFileBytes;

export const getBoardElementsLimit = (): number => getCurrentTariff().maxBoardElements;

export const getBoardElementsWarningThreshold = (): number =>
  Math.floor(getBoardElementsLimit() * 0.75);

export const canCreateClassroom = (): boolean => {
  if (!SUBSCRIPTION_BILLING_ENABLED) return true;
  const state = useSubscriptionStore.getState();
  return state.mock.classroomsUsed < getTariff(state.planId).maxActiveClassrooms;
};

export const isStorageQuotaReached = (): boolean => {
  if (!SUBSCRIPTION_BILLING_ENABLED) return false;
  const state = useSubscriptionStore.getState();
  return state.mock.storageUsedBytes >= getTariff(state.planId).storageBytes;
};

export const isBoardElementsLimitReached = (currentCount: number): boolean => {
  if (!SUBSCRIPTION_BILLING_ENABLED) return false;
  const state = useSubscriptionStore.getState();
  return state.mock.boardAtLimit || currentCount >= getTariff(state.planId).maxBoardElements;
};

export const getMaxBytesForKind = (kind: UploadKind): number =>
  kind === 'image' ? getMaxImageBytes() : getMaxFileBytes();

export const evaluateUpload = (file: File, kind: UploadKind): UploadEvaluation => {
  const state = useSubscriptionStore.getState();
  const tariff = getTariff(state.planId);
  const maxBytes = kind === 'image' ? tariff.maxImageBytes : tariff.maxFileBytes;

  if (SUBSCRIPTION_BILLING_ENABLED && isStorageQuotaReached()) {
    return { ok: false, reason: 'storage', planId: state.planId, maxBytes, kind };
  }

  if ((SUBSCRIPTION_BILLING_ENABLED && state.mock.forceOversizedFile) || file.size > maxBytes) {
    return { ok: false, reason: 'size', planId: state.planId, maxBytes, kind };
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
