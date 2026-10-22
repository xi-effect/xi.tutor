import { useEffect } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  setFileTooLargeMessage,
  setStorageWriteGuard,
  setTutorStorageLimitHandler,
  useClassroomCounts,
  useCurrentPlan,
  useStorageUsage,
} from 'common.services';
import {
  getFileTooLargeLimitMessage,
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
    setFileTooLargeMessage(getFileTooLargeLimitMessage);
    setStorageWriteGuard(() => {
      if (!isStorageQuotaReached()) return false;
      requestStorageLimitDialog();
      return true;
    });
    return () => {
      setTutorStorageLimitHandler(null);
      setFileTooLargeMessage(null);
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
