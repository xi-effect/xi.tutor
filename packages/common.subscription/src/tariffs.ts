export const PLAN_IDS = ['basic', 'pro'] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export const MB = 1024 * 1024;
export const GB = 1024 * MB;

export type TariffLimits = {
  id: PlanId;
  priceMonthlyRub: number;
  maxActiveClassrooms: number;
  storageBytes: number;
  maxImageBytes: number;
  maxFileBytes: number;
  maxBoardElements: number;
  maxVideoCallHoursPerMonth: number | null;
  extraProFeatures: boolean;
};

export const TARIFFS: Record<PlanId, TariffLimits> = {
  basic: {
    id: 'basic',
    priceMonthlyRub: 0,
    maxActiveClassrooms: 3,
    storageBytes: 500 * MB,
    maxImageBytes: 1 * MB,
    maxFileBytes: 5 * MB,
    maxBoardElements: 4000,
    maxVideoCallHoursPerMonth: 10,
    extraProFeatures: false,
  },
  pro: {
    id: 'pro',
    priceMonthlyRub: 1499,
    maxActiveClassrooms: 30,
    storageBytes: 20 * GB,
    maxImageBytes: 5 * MB,
    maxFileBytes: 30 * MB,
    maxBoardElements: 4000,
    maxVideoCallHoursPerMonth: null,
    extraProFeatures: true,
  },
};

export const DEFAULT_PRO_RENEWS_AT = '2026-10-08T00:00:00.000Z';

export const getTariff = (planId: PlanId): TariffLimits => TARIFFS[planId];
