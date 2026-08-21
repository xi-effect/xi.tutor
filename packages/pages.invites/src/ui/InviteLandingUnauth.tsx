import { useNavigate } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getInviteAuthSearch,
  getInviteTrackingId,
  persistPendingInviteCode,
  persistInviteProgressTrack,
  shouldTrackInviteLoginClicked,
  shouldTrackInviteSignupClicked,
  trackProductEvent,
} from 'common.utils';
import { useTranslation } from 'react-i18next';

type InviteLandingUnauthProps = {
  inviteId: string;
};

export const InviteLandingUnauth = ({ inviteId }: InviteLandingUnauthProps) => {
  const { t } = useTranslation('invites');
  const navigate = useNavigate();

  const goToAuth = (to: '/signup' | '/signin') => {
    persistPendingInviteCode(inviteId);
    persistInviteProgressTrack(to === '/signup' ? 'signup' : 'signin');
    const search = getInviteAuthSearch(inviteId);

    if (to === '/signup') {
      if (shouldTrackInviteSignupClicked(inviteId)) {
        void getInviteTrackingId(inviteId).then((invite_tracking_id) => {
          trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_SIGNUP_CLICKED, {
            invite_flow_version: 2,
            invite_tracking_id,
            source: 'invite',
          });
        });
      }
    } else if (shouldTrackInviteLoginClicked(inviteId)) {
      void getInviteTrackingId(inviteId).then((invite_tracking_id) => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_LOGIN_CLICKED, {
          invite_flow_version: 2,
          invite_tracking_id,
          source: 'invite',
        });
      });
    }

    navigate({ to, search });
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 p-2 sm:max-w-[500px] sm:gap-8">
      <div className="text-center">
        <h3 className="text-xl-base text-text-primary dark:text-text-primary font-semibold">
          {t('landing.title')}
        </h3>
      </div>

      <div className="flex flex-col justify-center gap-2">
        <Button
          className="h-auto min-h-12 w-full rounded-xl whitespace-normal"
          onClick={() => goToAuth('/signup')}
          data-umami-event="invite-signup"
        >
          {t('landing.signup')}
        </Button>
        <Button
          onClick={() => goToAuth('/signin')}
          className="text-text-primary dark:text-text-primary w-full rounded-xl"
          variant="none"
          data-umami-event="invite-login"
        >
          {t('landing.login')}
        </Button>
      </div>
    </div>
  );
};
