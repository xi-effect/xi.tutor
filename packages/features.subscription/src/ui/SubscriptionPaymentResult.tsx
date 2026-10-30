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
  useMonetizationDevStore,
  getCurrentSubscription,
} from 'common.services';
import {
  isSubscriptionDebugEnabled,
  isSubscriptionPeriodActive,
  useSubscriptionUiStore,
} from 'common.subscription';
import {
  billingPeriodFromSubscriptionDays,
  mapSubscriptionPaymentReturnResult,
  markSubscriptionPeriodExtendedLocally,
  trackOnce,
  trackConfirmedSubscriptionActivation,
  trackSubscriptionPaymentReturned,
} from 'common.utils';
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
  text?: ReactNode;
  children?: ReactNode;
}) => (
  <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center" aria-live="polite">
    <h1 className="font-playfair text-text-primary m-0 text-2xl leading-snug font-medium">
      {title}
    </h1>
    {text ? (
      <div className="text-text-secondary flex flex-col gap-0.5 text-sm leading-5">{text}</div>
    ) : null}
    {children ? <div className="flex w-full max-w-[280px] flex-col gap-2">{children}</div> : null}
  </div>
);

const resultButtonClass = 'h-12 w-full rounded-xl font-medium';
const ACTIVATION_CHECK_ATTEMPTS = 4;
const ACTIVATION_CHECK_INTERVAL_MS = 1000;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

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
  const paymentPreview = useMonetizationDevStore((state) => state.override.paymentPreview);
  const preview = isSubscriptionDebugEnabled() ? paymentPreview : null;
  const [phase, setPhase] = useState<PaymentPhase>(preview ?? (paymentId ? 'checking' : 'error'));
  const [confirmationUrl, setConfirmationUrl] = useState<string | null>(null);
  const [checkToken, setCheckToken] = useState(0);

  useEffect(() => {
    if (isUserLoading || !user) return;
    if (!isTutor) {
      void navigate({ to: '/' });
    }
  }, [isTutor, isUserLoading, navigate, user]);

  useEffect(() => {
    if (preview || isUserLoading || !user || !isTutor || paymentId) return;
    trackOnce('subscription_payment_returned:missing', () => {
      trackSubscriptionPaymentReturned({ result: 'unknown', targetPlan: 'pro' });
    });
  }, [isTutor, isUserLoading, paymentId, preview, user]);

  useEffect(() => {
    if (preview) {
      setPhase(preview);
      setConfirmationUrl(null);
      return;
    }

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
          const result = mapSubscriptionPaymentReturnResult(payment);
          trackOnce(`subscription_payment_returned:${paymentId}:${result}`, () => {
            trackSubscriptionPaymentReturned({
              result,
              targetPlan: 'pro',
              subscriptionDays: payment.subscription_days,
            });
          });
          await invalidateSubscriptionBilling(queryClient);
          if (!cancelled) setPhase('success');

          for (let attempt = 0; attempt < ACTIVATION_CHECK_ATTEMPTS && !cancelled; attempt += 1) {
            const subscription = await getCurrentSubscription();
            if (cancelled) return;
            if (subscription && isSubscriptionPeriodActive(subscription.subscription.ends_at)) {
              markSubscriptionPeriodExtendedLocally();
              trackConfirmedSubscriptionActivation({
                paymentId,
                plan: subscription.subscription.plan_kind,
                billingPeriod: billingPeriodFromSubscriptionDays(payment.subscription_days),
              });
              return;
            }
            await wait(ACTIVATION_CHECK_INTERVAL_MS);
          }
          return;
        }

        if (status === 'cancelled') {
          const result = mapSubscriptionPaymentReturnResult(payment);
          trackOnce(`subscription_payment_returned:${paymentId}:${result}`, () => {
            trackSubscriptionPaymentReturned({
              result,
              targetPlan: 'pro',
              subscriptionDays: payment.subscription_days,
            });
          });
          if (!cancelled) setPhase('cancelled');
          return;
        }

        sawPending = true;
        pendingConfirmationUrl = isConfirmationUrl(payment.confirmation_url)
          ? payment.confirmation_url
          : null;

        if (attempts >= PAYMENT_CHECK_ATTEMPTS) {
          trackOnce(`subscription_payment_returned:${paymentId}:pending`, () => {
            trackSubscriptionPaymentReturned({ result: 'pending', targetPlan: 'pro' });
          });
          showPending();
          return;
        }
      } catch (error) {
        if (cancelled) return;

        if (error instanceof SubscriptionPaymentLookupError) {
          trackOnce(`subscription_payment_returned:${paymentId}:unknown`, () => {
            trackSubscriptionPaymentReturned({ result: 'unknown', targetPlan: 'pro' });
          });
          setPhase('error');
          return;
        }

        if (attempts >= PAYMENT_CHECK_ATTEMPTS) {
          if (sawPending) {
            trackOnce(`subscription_payment_returned:${paymentId}:pending`, () => {
              trackSubscriptionPaymentReturned({ result: 'pending', targetPlan: 'pro' });
            });
            showPending();
          } else {
            trackOnce(`subscription_payment_returned:${paymentId}:unknown`, () => {
              trackSubscriptionPaymentReturned({ result: 'unknown', targetPlan: 'pro' });
            });
            setPhase('error');
          }
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
  }, [checkToken, isTutor, paymentId, preview, queryClient]);

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
        <ResultBlock
          title={t('paymentResult.successTitle')}
          text={
            <>
              <p className="m-0">{t('paymentResult.successText')}</p>
              <p className="m-0">{t('paymentResult.successTextLine2')}</p>
            </>
          }
        >
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
