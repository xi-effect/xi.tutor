import { AUTH_FLOW_LOGO_SIZE, InviteProgressCard, Logo } from 'common.ui';
import { useParams } from '@tanstack/react-router';
import { useEffect } from 'react';
import { SupportPageShell } from 'modules.navigation';
import { useCurrentUser } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getInviteTrackingId,
  persistPendingInviteCode,
  shouldTrackInvitePageViewed,
  trackOnce,
  trackProductEvent,
} from 'common.utils';
import { useTranslation } from 'react-i18next';
import { Invite } from './Invite';
import { InviteLandingUnauth } from './InviteLandingUnauth';
import { ErrorInvite } from './ErrorInvite';
import { useInvitePreview } from '../services';

export const InvitesPage = () => {
  const { t } = useTranslation('invites');
  const { inviteId } = useParams({ strict: false }) as { inviteId: string };
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isAuthenticated = Boolean(user?.id);
  const authPending = isUserLoading && !isAuthenticated;
  const { data, error, isLoading } = useInvitePreview(inviteId, {
    disabled: authPending || !isAuthenticated,
  });

  useEffect(() => {
    persistPendingInviteCode(inviteId);
  }, [inviteId]);

  useEffect(() => {
    if (!inviteId) return;
    if (!shouldTrackInvitePageViewed(inviteId)) return;

    trackOnce(`student_invite_page_viewed:${inviteId}`, () => {
      void getInviteTrackingId(inviteId).then((invite_tracking_id) => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_PAGE_VIEWED, {
          invite_flow_version: 2,
          invite_tracking_id,
        });
      });
    });
  }, [inviteId]);

  useEffect(() => {
    if (!inviteId) return;
    if (authPending) return;
    if (isAuthenticated && !data) return;

    trackOnce(`student_invite_opened:${inviteId}`, () => {
      void getInviteTrackingId(inviteId).then((invite_tracking_id) => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_OPENED, {
          student_authenticated: isAuthenticated,
          invite_flow_version: 2,
          invite_tracking_id,
        });
      });
    });
  }, [authPending, data, inviteId, isAuthenticated]);

  const content = (() => {
    if (authPending) {
      return (
        <div className="flex w-full min-w-0 flex-col items-center gap-4 p-4 sm:max-w-[500px] sm:p-8">
          <p className="text-text-primary dark:text-text-primary">{t('loading')}</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <InviteLandingUnauth inviteId={inviteId} />;
    }

    if (isLoading) {
      return (
        <div className="flex w-full min-w-0 flex-col items-center gap-4 p-4 sm:max-w-[500px] sm:p-8">
          <p className="text-text-primary dark:text-text-primary">{t('loading')}</p>
        </div>
      );
    }

    if (error) {
      return <ErrorInvite error={error} />;
    }

    if (!data) {
      return <ErrorInvite variant="not_found" />;
    }

    return <Invite invite={data} />;
  })();

  return (
    <SupportPageShell>
      <div className="flex min-w-0 flex-1 flex-col">
        {!authPending && !isAuthenticated ? (
          <InviteProgressCard placement="pageTop" isAuthenticated={false} />
        ) : null}
        <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8 sm:py-12">
          <Logo width={AUTH_FLOW_LOGO_SIZE.width} height={AUTH_FLOW_LOGO_SIZE.height} />
          {content}
        </section>
      </div>
    </SupportPageShell>
  );
};
