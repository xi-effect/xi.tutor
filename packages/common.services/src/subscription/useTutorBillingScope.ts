import { useCurrentUser } from '../user';

/** Тариф, подписка и хранилище меняются оплатой, промокодом и истечением периода — держим их свежими. */
export const BILLING_QUERY_FRESHNESS = {
  staleTime: 60_000,
  refetchOnWindowFocus: true,
} as const;

export const useTutorBillingScope = (enabled = true) => {
  const { data: user } = useCurrentUser();
  const userId = typeof user?.id === 'number' ? user.id : null;
  const isTutor = user?.default_layout === 'tutor';

  return {
    userId,
    isTutor,
    enabled: Boolean(enabled && isTutor && userId !== null),
  };
};
