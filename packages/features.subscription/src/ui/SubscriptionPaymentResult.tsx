import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@xipkg/button';
import { useNavigate } from '@tanstack/react-router';
import {
  getCurrentPlan,
  getCurrentSubscription,
  invalidateSubscriptionBilling,
  isProPaymentActivated,
  subscriptionQueryKeys,
  useCurrentUser,
} from 'common.services';
import { useSubscriptionUiStore } from 'common.subscription';
import { useTranslation } from 'react-i18next';
import { clearPendingSubscriptionPayment, readPendingSubscriptionPayment } from '../pendingPayment';

const PAYMENT_CHECK_ATTEMPTS = 8;
const PAYMENT_CHECK_INTERVAL_MS = 2000;

type PaymentPhase = 'checking' | 'success' | 'pending';

export const SubscriptionPaymentResult = () => {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const openOverview = useSubscriptionUiStore((state) => state.openOverview);
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const userId = typeof user?.id === 'number' ? user.id : null;
  const [phase, setPhase] = useState<PaymentPhase>('checking');
  const [checkToken, setCheckToken] = useState(0);

  useEffect(() => {
    if (isUserLoading || !user) return;
    if (!isTutor) {
      void navigate({ to: '/' });
    }
  }, [isTutor, isUserLoading, navigate, user]);

  useEffect(() => {
    if (!isTutor || userId === null) return;

    let cancelled = false;
    let timeoutId = 0;
    let attempts = 0;
    const pending = readPendingSubscriptionPayment();

    const tick = async () => {
      if (cancelled) return;
      attempts += 1;

      let activated = false;

      try {
        const [plan, subscription] = await Promise.all([
          queryClient.fetchQuery({
            queryKey: subscriptionQueryKeys.currentPlan(userId),
            queryFn: getCurrentPlan,
            staleTime: 0,
          }),
          queryClient.fetchQuery({
            queryKey: subscriptionQueryKeys.currentSubscription(userId),
            queryFn: getCurrentSubscription,
            staleTime: 0,
          }),
        ]);

        activated = isProPaymentActivated({
          planKind: plan.kind,
          subscriptionEndsAt: subscription?.subscription.ends_at,
          previousSubscriptionEndsAt: pending?.previousSubscriptionEndsAt,
        });
      } catch {
        activated = false;
      }

      if (cancelled) return;

      if (activated) {
        clearPendingSubscriptionPayment();
        await invalidateSubscriptionBilling(queryClient);
        if (!cancelled) setPhase('success');
        return;
      }

      if (attempts >= PAYMENT_CHECK_ATTEMPTS) {
        setPhase('pending');
        return;
      }

      timeoutId = window.setTimeout(() => {
        void tick();
      }, PAYMENT_CHECK_INTERVAL_MS);
    };

    setPhase('checking');
    void tick();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [checkToken, isTutor, queryClient, userId]);

  const handleContinue = () => {
    openOverview();
    void navigate({
      to: '/',
      search: { profile: 'subscription' },
    });
  };

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-4">
        {phase === 'checking' ? (
          <>
            <span className="text-text-primary text-3xl font-semibold">
              {t('paymentResult.checkingTitle')}
            </span>
            <p className="text-text-secondary text-sm">{t('paymentResult.checkingText')}</p>
          </>
        ) : null}

        {phase === 'success' ? (
          <>
            <span className="text-text-primary text-3xl font-semibold">
              {t('result.successTitle')}
            </span>
            <p className="text-text-secondary text-sm">{t('result.successText')}</p>
            <Button
              type="button"
              variant="primary"
              size="m"
              className="h-12 rounded-xl font-medium"
              onClick={handleContinue}
            >
              {t('paymentResult.continue')}
            </Button>
          </>
        ) : null}

        {phase === 'pending' ? (
          <>
            <span className="text-text-primary text-3xl font-semibold">
              {t('paymentResult.pendingTitle')}
            </span>
            <p className="text-text-secondary text-sm">{t('paymentResult.pendingText')}</p>
            <Button
              type="button"
              variant="primary"
              size="m"
              className="h-12 rounded-xl font-medium"
              onClick={() => setCheckToken((value) => value + 1)}
            >
              {t('paymentResult.recheck')}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};
