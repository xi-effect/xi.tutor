import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  hasMonetizationOverride,
  setFileTooLargeMessage,
  setStorageWriteGuard,
  setTutorClassroomLimitHandler,
  setTutorStorageLimitHandler,
  useClassroomCounts,
  useCurrentPlan,
  useCurrentSubscription,
  useCurrentUser,
  useMonetizationDevStore,
  useStorageUsage,
} from 'common.services';
import {
  getFileTooLargeLimitMessage,
  isStorageQuotaReached,
  isSubscriptionDebugEnabled,
  isSubscriptionPeriodActive,
  requestClassroomLimitDialog,
  requestStorageLimitDialog,
  useSubscriptionUiStore,
} from 'common.subscription';
import { observeSubscriptionLifecycle, toSubscriptionBillingPeriod } from 'common.utils';
import { SubscriptionDebugPanel } from './SubscriptionDebugPanel';
import { SubscriptionDialogs } from './SubscriptionDialogs';

export const SubscriptionHost = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: user } = useCurrentUser();
  const userId = user?.id ?? null;
  const prevUserIdRef = useRef(userId);
  const settingsOpenRequested = useSubscriptionUiStore((state) => state.settingsOpenRequested);
  const consumeSettingsOpenRequest = useSubscriptionUiStore(
    (state) => state.consumeSettingsOpenRequest,
  );

  const planQuery = useCurrentPlan();
  const subscriptionQuery = useCurrentSubscription();
  const monetizationOverride = useMonetizationDevStore((state) => state.override);
  useStorageUsage();
  useClassroomCounts();

  useEffect(() => {
    if (user?.default_layout !== 'tutor' || userId === null) return;
    if (hasMonetizationOverride(monetizationOverride)) return;
    if (!planQuery.isSuccess || !planQuery.data || !subscriptionQuery.isSuccess) return;

    const subscription = subscriptionQuery.data;
    observeSubscriptionLifecycle(
      String(userId),
      {
        plan: planQuery.data.kind === 'pro' ? 'pro' : 'basic',
        active: isSubscriptionPeriodActive(subscription?.subscription.ends_at),
        endsAt: subscription?.subscription.ends_at ?? null,
        billingPeriod: toSubscriptionBillingPeriod(subscription?.auto_renewal?.renewal_period),
        autoRenew: Boolean(subscription?.auto_renewal),
      },
      { deferActivation: pathname.includes('/settings/subscription/payment-result') },
    );
  }, [
    monetizationOverride,
    pathname,
    planQuery.data,
    planQuery.isSuccess,
    subscriptionQuery.data,
    subscriptionQuery.isSuccess,
    user?.default_layout,
    userId,
  ]);

  useEffect(() => {
    if (prevUserIdRef.current === userId) return;
    prevUserIdRef.current = userId;
    useSubscriptionUiStore.getState().reset();
  }, [userId]);

  useEffect(() => {
    setTutorStorageLimitHandler(requestStorageLimitDialog);
    setTutorClassroomLimitHandler(requestClassroomLimitDialog);
    setFileTooLargeMessage(getFileTooLargeLimitMessage);
    setStorageWriteGuard(() => {
      if (!isStorageQuotaReached()) return false;
      requestStorageLimitDialog();
      return true;
    });
    return () => {
      setTutorStorageLimitHandler(null);
      setTutorClassroomLimitHandler(null);
      setFileTooLargeMessage(null);
      setStorageWriteGuard(null);
    };
  }, []);

  useEffect(() => {
    if (!settingsOpenRequested) return;
    consumeSettingsOpenRequest();
    void navigate({
      to: pathname,
      search: (prev: Record<string, unknown>) => ({ ...prev, profile: 'subscription' }),
    });
  }, [consumeSettingsOpenRequest, navigate, pathname, settingsOpenRequested]);

  return (
    <>
      <SubscriptionDialogs />
      {isSubscriptionDebugEnabled() ? <SubscriptionDebugPanel /> : null}
    </>
  );
};
