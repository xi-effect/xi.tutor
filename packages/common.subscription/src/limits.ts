import i18n from 'i18next';
import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import { formatMegabytes } from './format';
import {
  countCachedActiveClassrooms,
  mergePlanLimits,
  readCachedCurrentPlan,
  readCachedStorageUsage,
} from './planCache';
import { useSubscriptionStore } from './store';
import { getTariff, type PlanId, type TariffLimits } from './tariffs';
import {
  requestClassroomLimitDialog,
  requestImageUpgradeDialog,
  requestStorageLimitDialog,
} from './uiStore';

export type UploadKind = 'image' | 'other';

export type UploadEvaluation =
  | { ok: true }
  | {
      ok: false;
      reason: 'storage' | 'size' | 'imageUpgrade';
      planId: PlanId;
      maxBytes: number;
      kind: UploadKind;
    };

/**
 * Лимиты текущего репетитора. Без кэша тарифа (ученик, тариф ещё грузится или запрос упал)
 * клиент берёт самый широкий тариф и не предлагает апгрейд: окончательно размер проверяет сервер.
 */
export const getCurrentTariff = (): TariffLimits => {
  const cached = readCachedCurrentPlan();
  if (cached) return mergePlanLimits(cached);
  return getTariff('pro');
};

export const getMaxImageBytes = (): number => getCurrentTariff().maxImageBytes;

export const getMaxFileBytes = (): number => getCurrentTariff().maxFileBytes;

export const getFileTooLargeLimitMessage = (): string => {
  if (!readCachedCurrentPlan()) {
    return i18n.t('limits.fileTooLargeGeneric', { ns: 'subscription' });
  }

  const tariff = getCurrentTariff();
  return i18n.t('limits.fileTooLargeBoth', {
    ns: 'subscription',
    image: formatMegabytes(tariff.maxImageBytes),
    other: formatMegabytes(tariff.maxFileBytes),
  });
};

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

const wouldExceedStorageQuota = (bytes: number): boolean => {
  if (!SUBSCRIPTION_BILLING_ENABLED) return false;

  const plan = readCachedCurrentPlan();
  const usage = readCachedStorageUsage();
  if (!plan || !usage) return false;

  return usage.total_storage_bytes + bytes > plan.max_total_storage_bytes;
};

export const isBoardElementsLimitReached = (currentCount: number): boolean => {
  const atLimitByCount = currentCount >= getCurrentTariff().maxBoardElements;
  if (!SUBSCRIPTION_BILLING_ENABLED) return atLimitByCount;
  return useSubscriptionStore.getState().mock.boardAtLimit || atLimitByCount;
};

export const evaluateUpload = (file: Pick<File, 'size'>, kind: UploadKind): UploadEvaluation => {
  const tariff = getCurrentTariff();
  const maxBytes = kind === 'image' ? tariff.maxImageBytes : tariff.maxFileBytes;

  if (wouldExceedStorageQuota(file.size)) {
    return { ok: false, reason: 'storage', planId: tariff.id, maxBytes, kind };
  }

  const proImageBytes = getTariff('pro').maxImageBytes;
  const fitsProImageLimit =
    kind === 'image' &&
    tariff.id !== 'pro' &&
    tariff.maxImageBytes < proImageBytes &&
    file.size > maxBytes &&
    file.size <= proImageBytes;

  if (SUBSCRIPTION_BILLING_ENABLED && fitsProImageLimit) {
    return { ok: false, reason: 'imageUpgrade', planId: tariff.id, maxBytes, kind };
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

/** Нельзя сделать кабинет активным, пока занят лимит активных кабинетов. Статус «Недоступно» пользователь не ставит. */
export const tryChangeClassroomStatus = (currentStatus: string, nextStatus: string): boolean => {
  if (nextStatus === currentStatus || nextStatus === 'locked') return false;
  if (nextStatus === 'active' && currentStatus !== 'active') {
    return tryStartClassroomCreate();
  }
  return true;
};

export const tryStartUpload = (file: Pick<File, 'size'>, kind: UploadKind): UploadEvaluation => {
  const result = evaluateUpload(file, kind);
  if (!result.ok && result.reason === 'storage') {
    requestStorageLimitDialog();
  }
  if (!result.ok && result.reason === 'imageUpgrade') {
    requestImageUpgradeDialog();
  }
  return result;
};
