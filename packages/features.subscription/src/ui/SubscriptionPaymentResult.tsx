import { type ReactNode, useEffect, useState } from 'react';
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

const ResultBlock = ({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: ReactNode;
}) => (
  <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
    <h1 className="font-playfair text-text-primary m-0 text-2xl leading-snug font-medium">
      {title}
    </h1>
    {text ? <p className="text-text-secondary m-0 text-sm leading-5">{text}</p> : null}
    {children ? <div className="flex w-full max-w-[280px] flex-col gap-2">{children}</div> : null}
  </div>
);

const resultButtonClass = 'h-12 w-full rounded-xl font-medium';

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
    <div className="flex h-full min-h-0 w-full items-center justify-center px-6 py-10">
      {phase === 'checking' ? (
        <ResultBlock
          title={t('paymentResult.checkingTitle')}
          text={t('paymentResult.checkingText')}
        />
      ) : null}

      {phase === 'success' ? (
        <ResultBlock title={t('paymentResult.successTitle')} text={t('result.successText')}>
          <Button
            type="button"
            variant="primary"
            size="m"
            className={resultButtonClass}
            onClick={() => openSubscription('overview')}
          >
            {t('paymentResult.continue')}
          </Button>
        </ResultBlock>
      ) : null}

      {phase === 'pending' ? (
        <ResultBlock title={t('paymentResult.pendingTitle')} text={t('paymentResult.pendingText')}>
          {confirmationUrl ? (
            <Button
              type="button"
              variant="primary"
              size="m"
              className={resultButtonClass}
              onClick={() => window.location.assign(confirmationUrl)}
            >
              {t('paymentResult.continuePayment')}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={confirmationUrl ? 'ghost' : 'primary'}
            size="m"
            className={resultButtonClass}
            onClick={() => setCheckToken((value) => value + 1)}
          >
            {t('paymentResult.recheck')}
          </Button>
        </ResultBlock>
      ) : null}

      {phase === 'cancelled' ? (
        <ResultBlock
          title={t('paymentResult.cancelledTitle')}
          text={t('paymentResult.cancelledText')}
        >
          <Button
            type="button"
            variant="primary"
            size="m"
            className={resultButtonClass}
            onClick={() => openSubscription('checkout')}
          >
            {t('paymentResult.retry')}
          </Button>
        </ResultBlock>
      ) : null}

      {phase === 'error' ? (
        <ResultBlock title={t('paymentResult.loadError')} text={t('paymentResult.loadErrorText')}>
          <Button
            type="button"
            variant="primary"
            size="m"
            className={resultButtonClass}
            onClick={() => openSubscription('overview')}
          >
            {t('result.back')}
          </Button>
        </ResultBlock>
      ) : null}
    </div>
  );
};
