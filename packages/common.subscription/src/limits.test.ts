import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MB } from './tariffs';

const readCachedCurrentPlan = vi.fn();
const readCachedStorageUsage = vi.fn();
const countCachedActiveClassrooms = vi.fn();

vi.mock('i18next', () => ({
  default: { t: (key: string) => key },
}));

vi.mock('./planCache', () => ({
  readCachedCurrentPlan: () => readCachedCurrentPlan(),
  readCachedStorageUsage: () => readCachedStorageUsage(),
  countCachedActiveClassrooms: () => countCachedActiveClassrooms(),
  mergePlanLimits: (plan: {
    kind: 'pro' | null;
    max_active_classrooms: number;
    max_total_storage_bytes: number;
  }) => ({
    id: plan.kind === 'pro' ? 'pro' : 'basic',
    maxImageBytes: plan.kind === 'pro' ? 5 * MB : 1 * MB,
    maxFileBytes: 5 * MB,
    maxActiveClassrooms: plan.max_active_classrooms,
    storageBytes: plan.max_total_storage_bytes,
    maxBoardElements: 4000,
  }),
}));

vi.mock('./store', () => ({
  useSubscriptionStore: {
    getState: () => ({ mock: { forceOversizedFile: false, boardAtLimit: false } }),
  },
}));

vi.mock('./uiStore', () => ({
  requestClassroomLimitDialog: vi.fn(),
  requestImageUpgradeDialog: vi.fn(),
  requestStorageLimitDialog: vi.fn(),
}));

import { canCreateClassroom, evaluateUpload, isStorageQuotaReached } from './limits';

const basicPlan = {
  kind: null,
  max_active_classrooms: 3,
  max_total_storage_bytes: 500 * MB,
};

describe('evaluateUpload', () => {
  beforeEach(() => {
    readCachedCurrentPlan.mockReset();
    readCachedStorageUsage.mockReset();
    countCachedActiveClassrooms.mockReset();
    readCachedCurrentPlan.mockReturnValue(undefined);
    readCachedStorageUsage.mockReturnValue(undefined);
    countCachedActiveClassrooms.mockReturnValue(null);
  });

  it('без кэша тарифа не предлагает апгрейд и берёт широкий лимит', () => {
    const result = evaluateUpload({ size: 2 * MB }, 'image');
    expect(result).toEqual({ ok: true });
  });

  it('на Базовом предлагает Про для изображения 1–5 МБ', () => {
    readCachedCurrentPlan.mockReturnValue(basicPlan);
    const result = evaluateUpload({ size: 2 * MB }, 'image');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('imageUpgrade');
  });

  it('отклоняет файл ровно больше лимита', () => {
    readCachedCurrentPlan.mockReturnValue(basicPlan);
    const result = evaluateUpload({ size: 5 * MB + 1 }, 'other');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('size');
  });

  it('пропускает файл ровно на границе лимита', () => {
    readCachedCurrentPlan.mockReturnValue(basicPlan);
    expect(evaluateUpload({ size: 5 * MB }, 'other')).toEqual({ ok: true });
  });

  it('блокирует загрузку, если файл не влезет в хранилище', () => {
    readCachedCurrentPlan.mockReturnValue(basicPlan);
    readCachedStorageUsage.mockReturnValue({ total_storage_bytes: 499 * MB });
    const result = evaluateUpload({ size: 2 * MB }, 'other');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('storage');
  });
});

describe('isStorageQuotaReached', () => {
  beforeEach(() => {
    readCachedCurrentPlan.mockReset();
    readCachedStorageUsage.mockReset();
  });

  it('без кэша не считает квоту достигнутой', () => {
    readCachedCurrentPlan.mockReturnValue(undefined);
    readCachedStorageUsage.mockReturnValue(undefined);
    expect(isStorageQuotaReached()).toBe(false);
  });

  it('считает квоту достигнутой при usage >= max', () => {
    readCachedCurrentPlan.mockReturnValue(basicPlan);
    readCachedStorageUsage.mockReturnValue({ total_storage_bytes: 500 * MB });
    expect(isStorageQuotaReached()).toBe(true);
  });
});

describe('canCreateClassroom', () => {
  beforeEach(() => {
    readCachedCurrentPlan.mockReset();
    countCachedActiveClassrooms.mockReset();
  });

  it('без кэша не блокирует создание', () => {
    readCachedCurrentPlan.mockReturnValue(undefined);
    countCachedActiveClassrooms.mockReturnValue(null);
    expect(canCreateClassroom()).toBe(true);
  });

  it('блокирует, когда активных кабинетов уже столько, сколько в лимите', () => {
    readCachedCurrentPlan.mockReturnValue(basicPlan);
    countCachedActiveClassrooms.mockReturnValue(3);
    expect(canCreateClassroom()).toBe(false);
  });
});
