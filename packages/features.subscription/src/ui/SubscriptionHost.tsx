import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  setFileTooLargeMessage,
  setStorageWriteGuard,
  setTutorClassroomLimitHandler,
  setTutorStorageLimitHandler,
  useClassroomCounts,
  useCurrentPlan,
  useCurrentUser,
  useStorageUsage,
} from 'common.services';
import {
  getFileTooLargeLimitMessage,
  isStorageQuotaReached,
  isSubscriptionDebugEnabled,
  requestClassroomLimitDialog,
  requestStorageLimitDialog,
  useSubscriptionUiStore,
} from 'common.subscription';
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

  useCurrentPlan();
  useStorageUsage();
  useClassroomCounts();

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
