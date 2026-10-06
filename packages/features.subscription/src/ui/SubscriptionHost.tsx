import { useEffect } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  useAllTutorClassrooms,
  useCurrentPlan,
  useCurrentUser,
  useStorageUsage,
} from 'common.services';
import { isSubscriptionDebugEnabled, useSubscriptionUiStore } from 'common.subscription';
import { SubscriptionDebugPanel } from './SubscriptionDebugPanel';
import { SubscriptionDialogs } from './SubscriptionDialogs';

export const SubscriptionHost = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const settingsOpenRequested = useSubscriptionUiStore((state) => state.settingsOpenRequested);
  const consumeSettingsOpenRequest = useSubscriptionUiStore(
    (state) => state.consumeSettingsOpenRequest,
  );

  useCurrentPlan();
  useStorageUsage();
  useAllTutorClassrooms(Boolean(isTutor));

  useEffect(() => {
    if (!settingsOpenRequested) return;
    consumeSettingsOpenRequest();
    void navigate({
      to: pathname,
      search: { profile: 'subscription' },
    });
  }, [consumeSettingsOpenRequest, navigate, pathname, settingsOpenRequested]);

  return (
    <>
      <SubscriptionDialogs />
      {isSubscriptionDebugEnabled() ? <SubscriptionDebugPanel /> : null}
    </>
  );
};
