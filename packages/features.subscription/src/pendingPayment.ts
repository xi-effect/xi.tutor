const STORAGE_KEY = 'sovlium.subscription.pendingPayment';

export type PendingSubscriptionPayment = {
  paymentId: string;
  previousSubscriptionEndsAt?: string;
};

export const isConfirmationUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const savePendingSubscriptionPayment = (value: PendingSubscriptionPayment) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export const readPendingSubscriptionPayment = (): PendingSubscriptionPayment | null => {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      paymentId?: unknown;
      previousSubscriptionEndsAt?: unknown;
    };

    if (!parsed || typeof parsed.paymentId !== 'string' || parsed.paymentId.length === 0) {
      return null;
    }

    return {
      paymentId: parsed.paymentId,
      previousSubscriptionEndsAt:
        typeof parsed.previousSubscriptionEndsAt === 'string'
          ? parsed.previousSubscriptionEndsAt
          : undefined,
    };
  } catch {
    return null;
  }
};

export const clearPendingSubscriptionPayment = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};
