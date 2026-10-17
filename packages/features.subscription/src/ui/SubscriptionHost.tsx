import { useEffect } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  setStorageWriteGuard,
  setTutorStorageLimitHandler,
  useClassroomCounts,
  useCurrentPlan,
  useStorageUsage,
} from 'common.services';
import {
  isStorageQuotaReached,
  isSubscriptionDebugEnabled,
  requestStorageLimitDialog,
  useSubscriptionUiStore,
} from 'common.subscription';
import { SubscriptionDebugPanel } from './SubscriptionDebugPanel';
import { SubscriptionDialogs } from './SubscriptionDialogs';

export const SubscriptionHost = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const settingsOpenRequested = useSubscriptionUiStore((state) => state.settingsOpenRequested);
  const consumeSettingsOpenRequest = useSubscriptionUiStore(
    (state) => state.consumeSettingsOpenRequest,
  );

  useCurrentPlan();
  useStorageUsage();
  useClassroomCounts();

  useEffect(() => {
    setTutorStorageLimitHandler(requestStorageLimitDialog);
    setStorageWriteGuard(() => {
      if (!isStorageQuotaReached()) return false;
      requestStorageLimitDialog();
      return true;
    });
    return () => {
      setTutorStorageLimitHandler(null);
      setStorageWriteGuard(null);
    };
  }, []);

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
