export const isProPaymentActivated = (input: {
  planKind: 'pro' | null | undefined;
  subscriptionEndsAt: string | null | undefined;
  previousSubscriptionEndsAt?: string;
}): boolean => {
  if (input.planKind !== 'pro' || !input.subscriptionEndsAt) {
    return false;
  }

  if (!input.previousSubscriptionEndsAt) {
    return true;
  }

  const next = Date.parse(input.subscriptionEndsAt);
  const previous = Date.parse(input.previousSubscriptionEndsAt);

  if (Number.isNaN(next) || Number.isNaN(previous)) {
    return false;
  }

  return next > previous;
};
