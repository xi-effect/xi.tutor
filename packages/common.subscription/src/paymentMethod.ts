export type LinkedPaymentMethod = {
  last4: string;
  paymentSystem: string;
  paymentMethodId: string;
};

/** Временный mock сохранённой карты, пока ЮKassa не включила рекуррентные платежи. */
export const MOCK_LINKED_PAYMENT_METHOD: LinkedPaymentMethod = {
  last4: '4242',
  paymentSystem: 'МИР',
  paymentMethodId: 'mock_payment_method_id',
};

export const getSavedPaymentMethod = (
  savedByUserId: Record<string, LinkedPaymentMethod | null>,
  userId: number,
): LinkedPaymentMethod | null => {
  const key = String(userId);
  if (Object.prototype.hasOwnProperty.call(savedByUserId, key)) {
    return savedByUserId[key] ?? null;
  }
  return MOCK_LINKED_PAYMENT_METHOD;
};
