import { useEffect, useRef, useState } from 'react';
import { USER_FLAG_KEYS, useCurrentUser, useDismissibleUserFlag } from 'common.services';
import { useCallStore } from 'modules.calls';
import { PRODUCT_ANALYTICS_EVENTS, trackOnce, trackProductEvent } from 'common.utils';
import { TestingEndAnnouncementModal } from './TestingEndAnnouncementModal';

const isReadyTutor = (user: { default_layout: string; onboarding_stage: string } | undefined) =>
  user?.default_layout === 'tutor' &&
  (user.onboarding_stage === 'completed' || user.onboarding_stage === 'training');

export const TestingEndAnnouncementHost = () => {
  const { data: user } = useCurrentUser();
  const inCall = useCallStore((state) => Boolean(state.token));
  const ready = isReadyTutor(user) && !inCall;
  const { visible, dismiss } = useDismissibleUserFlag(
    USER_FLAG_KEYS.SUBSCRIPTION_ANNOUNCEMENT_DISMISSED,
    { enabled: ready },
  );
  const [closedThisVisit, setClosedThisVisit] = useState(false);
  const prevUserIdRef = useRef<number | null>(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (prevUserIdRef.current === userId) return;
    prevUserIdRef.current = userId;
    dismissedRef.current = false;
    setClosedThisVisit(false);
  }, [user?.id]);

  const open = visible && ready && !closedThisVisit;

  useEffect(() => {
    if (!open || user?.id == null) return;
    trackOnce(`subscription_announcement_shown:${user.id}`, () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ANNOUNCEMENT_SHOWN, {
        user_role: 'tutor',
        onboarding_stage: user.onboarding_stage,
      });
    });
  }, [open, user?.id, user?.onboarding_stage]);

  if (!open) return null;

  return (
    <TestingEndAnnouncementModal
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
      onArticleOpen={() => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ANNOUNCEMENT_ARTICLE_OPENED, {
          user_role: 'tutor',
          onboarding_stage: user?.onboarding_stage,
        });
      }}
    />
  );
};
