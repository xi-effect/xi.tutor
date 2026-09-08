export type PromoStatus = 'success' | 'invalid' | 'expired' | 'error';

export type PromoResult =
  | { status: 'success'; code: string; addedDays: number }
  | { status: Exclude<PromoStatus, 'success'>; code: string; addedDays: 0 };

export const MOCK_PROMO_ADDED_DAYS = 30;

export const applyMockPromo = (raw: string): PromoResult => {
  const code = raw.trim().toUpperCase();

  if (!code) {
    return { status: 'invalid', code, addedDays: 0 };
  }

  if (code === 'EXPIRED') {
    return { status: 'expired', code, addedDays: 0 };
  }

  if (code === 'ERROR') {
    return { status: 'error', code, addedDays: 0 };
  }

  return { status: 'success', code, addedDays: MOCK_PROMO_ADDED_DAYS };
};
