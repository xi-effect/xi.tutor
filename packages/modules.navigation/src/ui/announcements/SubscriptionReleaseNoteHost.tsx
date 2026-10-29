import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import {
  USER_FLAG_KEYS,
  useCurrentSubscription,
  useCurrentUser,
  useDismissibleUserFlag,
} from 'common.services';
import { isSubscriptionPeriodActive, useSubscriptionUiStore } from 'common.subscription';
import { isOnboardingSurfaceActive, subscribeOnboardingSurface } from 'common.ui';
import { useCallStore } from 'modules.calls';
import {
  PRODUCT_ANALYTICS_EVENTS,
  setSubscriptionAnalyticsSource,
  trackOnce,
  trackProductEvent,
} from 'common.utils';
import { SubscriptionReleaseNoteModal } from './SubscriptionReleaseNoteModal';

/** Пауза после онбординга, чтобы новость не открывалась в тот же кадр. */
const NEWS_AFTER_ONBOARDING_MS = 600;
const PAYMENT_RESULT_PATH = '/settings/subscription/payment-result';

const isReadyTutor = (user: { default_layout: string; onboarding_stage: string } | undefined) =>
  user?.default_layout === 'tutor' &&
  (user.onboarding_stage === 'completed' || user.onboarding_stage === 'training');

export const SubscriptionReleaseNoteHost = () => {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false }) as { profile?: string };
  const onSubscriptionSurface =
    pathname.startsWith(PAYMENT_RESULT_PATH) ||
    pathname.includes('/settings/subscription') ||
    search.profile === 'subscription';
  const inCall = useCallStore((state) => Boolean(state.token));
  const ready = isReadyTutor(user) && !inCall && !onSubscriptionSurface;
  const subscriptionQuery = useCurrentSubscription({ enabled: ready });
  const hasActivePaidSubscription = isSubscriptionPeriodActive(
    subscriptionQuery.data?.subscription.ends_at,
  );
  const { visible, dismiss } = useDismissibleUserFlag(
    USER_FLAG_KEYS.SUBSCRIPTION_RELEASE_NOTE_DISMISSED,
    { enabled: ready },
  );
  const [closedThisVisit, setClosedThisVisit] = useState(false);
  const isNewRegistration = user?.onboarding_stage === 'training';
  const [deferNews, setDeferNews] = useState(isNewRegistration);
  const registrationRef = useRef(isNewRegistration);
  const prevUserIdRef = useRef<number | null>(null);
  const dismissedRef = useRef(false);

  if (registrationRef.current !== isNewRegistration) {
    registrationRef.current = isNewRegistration;
    setDeferNews(isNewRegistration);
  }

  useEffect(() => {
    const userId = user?.id ?? null;
    if (prevUserIdRef.current === userId) return;
    prevUserIdRef.current = userId;
    dismissedRef.current = false;
    setClosedThisVisit(false);
  }, [user?.id]);

  useLayoutEffect(() => {
    if (!isNewRegistration) return;

    let releaseTimer = 0;

    const sync = () => {
      window.clearTimeout(releaseTimer);
      if (isOnboardingSurfaceActive()) {
        setDeferNews(true);
        return;
      }

      releaseTimer = window.setTimeout(() => {
        if (!isOnboardingSurfaceActive()) setDeferNews(false);
      }, NEWS_AFTER_ONBOARDING_MS);
    };

    sync();
    const unsubscribe = subscribeOnboardingSurface(sync);

    return () => {
      window.clearTimeout(releaseTimer);
      unsubscribe();
    };
  }, [isNewRegistration, user?.id]);

  const open =
    visible &&
    ready &&
    !closedThisVisit &&
    !deferNews &&
    (subscriptionQuery.isSuccess || subscriptionQuery.isError) &&
    !hasActivePaidSubscription;

  useEffect(() => {
    if (!open || user?.id == null) return;
    trackOnce(`subscription_release_note_shown:${user.id}`, () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ANNOUNCEMENT_SHOWN, {
        user_role: 'tutor',
        onboarding_stage: user.onboarding_stage,
      });
    });
  }, [open, user?.id, user?.onboarding_stage]);

  if (!open) return null;

  return (
    <SubscriptionReleaseNoteModal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setClosedThisVisit(true);
          if (dismissedRef.current) return;
          trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ANNOUNCEMENT_CLOSED, {
            user_role: 'tutor',
            onboarding_stage: user?.onboarding_stage,
          });
        }
      }}
      onDismissForever={() => {
        dismissedRef.current = true;
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ANNOUNCEMENT_DISMISSED, {
          user_role: 'tutor',
          onboarding_stage: user?.onboarding_stage,
        });
        dismiss();
        setClosedThisVisit(true);
      }}
      onActivatePromo={() => {
        setSubscriptionAnalyticsSource('announcement');
        useSubscriptionUiStore.getState().setAnalyticsSource('announcement');
        setClosedThisVisit(true);
        void navigate({ to: '/', search: { profile: 'subscription' } });
      }}
      onArticleOpen={() => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ANNOUNCEMENT_ARTICLE_OPENED, {
          user_role: 'tutor',
          source: 'announcement',
          onboarding_stage: user?.onboarding_stage,
        });
      }}
    />
  );
};
