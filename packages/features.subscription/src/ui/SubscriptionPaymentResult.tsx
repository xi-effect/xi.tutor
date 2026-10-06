import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@xipkg/button';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  SubscriptionPaymentLookupError,
  getSubscriptionPayment,
  getSubscriptionPaymentStatus,
  invalidateSubscriptionBilling,
  useCurrentUser,
} from 'common.services';
import { useSubscriptionUiStore } from 'common.subscription';
import { useTranslation } from 'react-i18next';
import { isConfirmationUrl } from '../pendingPayment';

const PAYMENT_CHECK_ATTEMPTS = 8;
const PAYMENT_CHECK_INTERVAL_MS = 2000;

type PaymentPhase = 'checking' | 'pending' | 'success' | 'cancelled' | 'error';

export const SubscriptionPaymentResult = () => {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const openOverview = useSubscriptionUiStore((state) => state.openOverview);
  const openCheckout = useSubscriptionUiStore((state) => state.openCheckout);
  const search = useSearch({ strict: false }) as { payment_id?: string };
  const paymentId = typeof search.payment_id === 'string' ? search.payment_id : '';
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const [phase, setPhase] = useState<PaymentPhase>(paymentId ? 'checking' : 'error');
  const [confirmationUrl, setConfirmationUrl] = useState<string | null>(null);
  const [checkToken, setCheckToken] = useState(0);

  useEffect(() => {
    if (isUserLoading || !user) return;
    if (!isTutor) {
      void navigate({ to: '/' });
    }
  }, [isTutor, isUserLoading, navigate, user]);

  useEffect(() => {
    if (!isTutor || !paymentId) return;

    let cancelled = false;
    let timeoutId = 0;
    let attempts = 0;
    let pendingConfirmationUrl: string | null = null;
    let sawPending = false;

    const showPending = () => {
      setConfirmationUrl(pendingConfirmationUrl);
      setPhase('pending');
    };

    const tick = async () => {
      if (cancelled) return;
      attempts += 1;

      try {
        const payment = await getSubscriptionPayment(paymentId);
        if (cancelled) return;

        const status = getSubscriptionPaymentStatus(payment);

        if (status === 'success') {
          await invalidateSubscriptionBilling(queryClient);
          if (!cancelled) setPhase('success');
          return;
        }

        if (status === 'cancelled') {
          if (payment.cancellation_reason) {
            console.debug('Subscription payment cancelled', payment.cancellation_reason);
          }
          if (!cancelled) setPhase('cancelled');
          return;
        }

        sawPending = true;
        pendingConfirmationUrl = isConfirmationUrl(payment.confirmation_url)
          ? payment.confirmation_url
          : null;

        if (attempts >= PAYMENT_CHECK_ATTEMPTS) {
          showPending();
          return;
        }
      } catch (error) {
        if (cancelled) return;

        if (error instanceof SubscriptionPaymentLookupError) {
          setPhase('error');
          return;
        }

        if (attempts >= PAYMENT_CHECK_ATTEMPTS) {
          if (sawPending) showPending();
          else setPhase('error');
          return;
        }
      }

      timeoutId = window.setTimeout(() => {
        void tick();
      }, PAYMENT_CHECK_INTERVAL_MS);
    };

    setPhase('checking');
    setConfirmationUrl(null);
    void tick();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [checkToken, isTutor, paymentId, queryClient]);

  const openSubscription = (screen: 'overview' | 'checkout') => {
    if (screen === 'checkout') openCheckout();
    else openOverview();

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
              {t('paymentResult.successTitle')}
            </span>
            <p className="text-text-secondary text-sm">{t('result.successText')}</p>
            <Button
              type="button"
              variant="primary"
              size="m"
              className="h-12 rounded-xl font-medium"
              onClick={() => openSubscription('overview')}
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
            {confirmationUrl ? (
              <Button
                type="button"
                variant="primary"
                size="m"
                className="h-12 rounded-xl font-medium"
                onClick={() => window.location.assign(confirmationUrl)}
              >
                {t('paymentResult.continuePayment')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant={confirmationUrl ? 'ghost' : 'primary'}
              size="m"
              className="h-12 rounded-xl font-medium"
              onClick={() => setCheckToken((value) => value + 1)}
            >
              {t('paymentResult.recheck')}
            </Button>
          </>
        ) : null}

        {phase === 'cancelled' ? (
          <>
            <span className="text-text-primary text-3xl font-semibold">
              {t('paymentResult.cancelledTitle')}
            </span>
            <p className="text-text-secondary text-sm">{t('paymentResult.cancelledText')}</p>
            <Button
              type="button"
              variant="primary"
              size="m"
              className="h-12 rounded-xl font-medium"
              onClick={() => openSubscription('checkout')}
            >
              {t('paymentResult.retry')}
            </Button>
          </>
        ) : null}

        {phase === 'error' ? (
          <>
            <span className="text-text-primary text-3xl font-semibold">
              {t('paymentResult.loadError')}
            </span>
            <Button
              type="button"
              variant="primary"
              size="m"
              className="h-12 rounded-xl font-medium"
              onClick={() => openSubscription('overview')}
            >
              {t('result.back')}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};
