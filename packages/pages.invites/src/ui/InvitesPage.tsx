import { Logo } from 'common.ui';
import { useParams } from '@tanstack/react-router';
import { useEffect } from 'react';
import { SupportPageShell } from 'modules.navigation';
import { useCurrentUser } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getInviteTrackingId,
  trackOnce,
  trackProductEvent,
} from 'common.utils';
import { useTranslation } from 'react-i18next';
import { Invite } from './Invite';
import { ErrorInvite } from './ErrorInvite';
import { useInvitePreview } from '../services';

export const InvitesPage = () => {
  const { t } = useTranslation('invites');
  const { inviteId } = useParams({ strict: false }) as { inviteId: string };
  const { data, error, isLoading } = useInvitePreview(inviteId);
  const { data: user } = useCurrentUser();

  useEffect(() => {
    localStorage.removeItem('invite.pending_code');
  }, []);

  // Открытие страницы, не дожидаясь ответа preview-запроса (в отличие от
  // student_invite_opened ниже) — часть новой воронки v2, см. ТЗ п.11.
  useEffect(() => {
    if (!inviteId) return;

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
    if (!data || !inviteId) return;

    trackOnce(`student_invite_opened:${inviteId}`, () => {
      void getInviteTrackingId(inviteId).then((invite_tracking_id) => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_OPENED, {
          invite_id: inviteId,
          tutor_id: String(data.tutor.user_id),
          student_authenticated: Boolean(user?.id),
          invite_flow_version: 2,
          invite_tracking_id,
        });
      });
    });
  }, [data, inviteId, user?.id]);

  if (isLoading) {
    return (
      <SupportPageShell>
        <section className="relative flex flex-1 flex-col items-center justify-center py-24">
          <div className="absolute top-24">
            <Logo />
          </div>
          <div className="flex w-full flex-col items-center gap-4 p-8 sm:w-[400px]">
            <p className="text-text-primary dark:text-text-primary">{t('loading')}</p>
          </div>
        </section>
      </SupportPageShell>
    );
  }

  return (
    <SupportPageShell>
      <section className="relative flex flex-1 flex-col items-center justify-center py-24">
        <div className="absolute top-24">
          <Logo />
        </div>
        {error ? (
          <ErrorInvite error={error} />
        ) : data ? (
          <Invite invite={data} />
        ) : (
          <ErrorInvite error={t('notFound')} />
        )}
      </section>
    </SupportPageShell>
  );
};
