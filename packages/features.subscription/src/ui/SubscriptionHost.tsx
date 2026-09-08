import { useEffect } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  SUBSCRIPTION_BILLING_ENABLED,
  isSubscriptionDebugEnabled,
  isPaidPeriodExpired,
  useSubscriptionStore,
  useSubscriptionUiStore,
} from 'common.subscription';
import { SubscriptionDebugPanel } from './SubscriptionDebugPanel';
import { SubscriptionDialogs } from './SubscriptionDialogs';

export const SubscriptionHost = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const settingsOpenRequested = useSubscriptionUiStore((s) => s.settingsOpenRequested);
  const consumeSettingsOpenRequest = useSubscriptionUiStore((s) => s.consumeSettingsOpenRequest);
  const revertToBasic = useSubscriptionStore((s) => s.revertToBasic);
  const planId = useSubscriptionStore((s) => s.planId);
  const renewsAt = useSubscriptionStore((s) => s.renewsAt);

  useEffect(() => {
    if (!SUBSCRIPTION_BILLING_ENABLED) return;
    if (isPaidPeriodExpired(planId, renewsAt)) {
      revertToBasic();
    }
  }, [planId, renewsAt, revertToBasic]);

  useEffect(() => {
    if (!settingsOpenRequested) return;
    consumeSettingsOpenRequest();
    void navigate({
      to: pathname,
      search: { profile: 'subscription' },
    });
  }, [consumeSettingsOpenRequest, navigate, pathname, settingsOpenRequested]);

  if (!SUBSCRIPTION_BILLING_ENABLED) {
    return null;
  }

  return (
    <>
      <SubscriptionDialogs />
      {isSubscriptionDebugEnabled() ? <SubscriptionDebugPanel /> : null}
    </>
  );
};
