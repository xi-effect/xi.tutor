import { useNavigate, useParams } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { InviteT } from '../types';
import { useAcceptInvite } from '../services';

export const Invite = ({ invite }: { invite: InviteT }) => {
  const { t } = useTranslation('invites');
  const navigate = useNavigate();
  const { inviteId } = useParams({ strict: false }) as { inviteId: string };
  const { mutate, isPending } = useAcceptInvite();

  const isInviteAccepted =
    (invite.kind === 'individual' && invite.existing_classroom_id) ||
    (invite.kind === 'group' && invite.has_already_joined);

  const getInviteTitle = () => (isInviteAccepted ? t('title.accepted') : t('title.received'));

  const getAcceptButtonText = () =>
    isInviteAccepted ? t('actions.goToClassroom') : t('actions.accept');

  const acceptInvite = () => {
    if (invite.kind === 'group') {
      if (invite.has_already_joined) {
        if (invite.classroom?.id) {
          navigate({ to: `/classrooms/${invite.classroom.id}` });
        } else {
          navigate({ to: `/classrooms` });
        }
      } else {
        mutate({
          code: inviteId,
          invite_kind: 'group',
          tutor_id: String(invite.tutor.user_id),
        });
      }
    }

    if (invite.kind === 'individual') {
      if (invite.existing_classroom_id) {
        navigate({ to: `/classrooms/${invite.existing_classroom_id}` }); // Переход по старому приглашению в индивидуальный кабинет
      } else {
        mutate({
          code: inviteId,
          invite_kind: 'student',
          tutor_id: String(invite.tutor.user_id),
        });
      }
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 p-2 sm:w-[500px]">
      <div className="text-center">
        <h3 className="text-xl-base text-text-primary dark:text-text-primary mb-2 font-semibold">
          {getInviteTitle()}
        </h3>
        <span className="text-text-primary dark:text-text-primary">
          {invite.kind === 'individual'
            ? t('subtitle.tutor')
            : t('subtitle.groupFromTutor', { name: invite.classroom.name })}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar size="xl">
          <AvatarImage
            src={`https://api.sovlium.ru/files/users/${invite.tutor.user_id}/avatar.webp`}
            alt="user avatar"
          />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col items-center">
          <p className="text-text-primary dark:text-text-primary">{invite.tutor.display_name}</p>
          <span className="text-s-base text-text-primary dark:text-text-primary">
            {invite.tutor.username}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-2">
        <Button
          className="w-full rounded-xl"
          onClick={acceptInvite}
          loading={isPending}
          disabled={isPending}
          data-umami-event="invite-accept"
          data-umami-event-kind={invite.kind}
        >
          {getAcceptButtonText()}
        </Button>
        <Button
          onClick={() => navigate({ to: '/' })}
          className="text-text-primary dark:text-text-primary w-full rounded-xl"
          variant="none"
          disabled={isPending}
          data-umami-event="invite-decline"
          data-umami-event-kind={invite.kind}
        >
          {t('actions.decline')}
        </Button>
      </div>
    </div>
  );
};
