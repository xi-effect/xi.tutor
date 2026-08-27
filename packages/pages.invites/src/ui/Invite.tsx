import { useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import {
  clearPendingInviteCode,
  mapInviteAcceptError,
  type InviteAcceptFailureReason,
} from 'common.utils';
import { useTranslation } from 'react-i18next';
import { InviteT } from '../types';
import { useAcceptInvite } from '../services';
import {
  getAcceptErrorVariant,
  getExistingClassroomId,
  isAlreadyConnected,
} from '../services/invitePageLogic';

export const Invite = ({ invite }: { invite: InviteT }) => {
  const { t } = useTranslation('invites');
  const navigate = useNavigate();
  const { inviteId } = useParams({ strict: false }) as { inviteId: string };
  const { mutate, isPending, isSuccess, data, error, reset } = useAcceptInvite();
  const acceptLockRef = useRef(false);

  const alreadyConnected = isAlreadyConnected(invite);
  const existingClassroomId = getExistingClassroomId(invite);
  const connectedClassroomId = data?.id ?? existingClassroomId;
  const acceptFailedReason: InviteAcceptFailureReason | undefined = error
    ? mapInviteAcceptError(error)
    : undefined;
  const errorVariant = acceptFailedReason ? getAcceptErrorVariant(acceptFailedReason) : undefined;
  const showSuccess = isSuccess && typeof data?.id === 'number';
  const showAlreadyConnected = alreadyConnected || acceptFailedReason === 'already_connected';
  const showSelfInvite = acceptFailedReason === 'self_invite';

  const goToClassroom = (classroomId?: number) => {
    clearPendingInviteCode();
    if (classroomId) {
      navigate({ to: `/classrooms/${classroomId}` });
      return;
    }
    navigate({ to: '/classrooms' });
  };

  const acceptInvite = () => {
    if (alreadyConnected) {
      goToClassroom(existingClassroomId);
      return;
    }

    if (acceptLockRef.current || isPending) return;
    acceptLockRef.current = true;

    mutate(
      {
        code: inviteId,
        invite_kind: invite.kind === 'group' ? 'group' : 'student',
      },
      {
        onError: () => {
          acceptLockRef.current = false;
        },
        onSuccess: () => {
          acceptLockRef.current = true;
        },
      },
    );
  };

  const retryAccept = () => {
    reset();
    acceptLockRef.current = false;
    acceptInvite();
  };

  if (showSuccess) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-6 p-2 sm:max-w-[500px] sm:gap-8">
        <div className="text-center">
          <h3 className="text-xl-base text-text-primary dark:text-text-primary mb-2 font-semibold break-words">
            {t('success.title')}
          </h3>
          <p className="text-text-primary dark:text-text-primary">{t('success.description')}</p>
        </div>
        <Button className="w-full rounded-xl" onClick={() => goToClassroom(data.id)}>
          {t('actions.goToClassroom')}
        </Button>
      </div>
    );
  }

  if (showSelfInvite && !isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-6 p-2 sm:max-w-[500px] sm:gap-8">
        <div className="text-center">
          <h3 className="text-xl-base text-text-primary dark:text-text-primary mb-2 font-semibold break-words">
            {t('error.selfInviteTitle')}
          </h3>
          <p className="text-text-primary dark:text-text-primary">{t('error.selfInviteBody')}</p>
        </div>
        <Button
          onClick={() => navigate({ to: '/' })}
          className="w-full rounded-xl"
          variant="secondary"
        >
          {t('actions.decline')}
        </Button>
      </div>
    );
  }

  if (showAlreadyConnected && !isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-6 p-2 sm:max-w-[500px] sm:gap-8">
        <div className="text-center">
          <h3 className="text-xl-base text-text-primary dark:text-text-primary mb-2 font-semibold break-words">
            {t('alreadyConnected.title')}
          </h3>
          <p className="text-text-primary dark:text-text-primary">
            {t('alreadyConnected.description')}
          </p>
        </div>
        {connectedClassroomId ? (
          <Button className="w-full rounded-xl" onClick={() => goToClassroom(connectedClassroomId)}>
            {t('actions.goToClassroom')}
          </Button>
        ) : (
          <Button className="w-full rounded-xl" onClick={() => goToClassroom()}>
            {t('actions.goToClassrooms')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 p-2 sm:max-w-[500px] sm:gap-8">
      <div className="text-center">
        <h3 className="text-xl-base text-text-primary dark:text-text-primary mb-2 font-semibold break-words">
          {t('title.received')}
        </h3>
        {invite.kind === 'group' ? (
          <p className="text-text-secondary dark:text-text-secondary text-sm">
            {t('subtitle.groupFromTutor', { name: invite.classroom.name })}
          </p>
        ) : null}
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
          <p className="text-text-primary dark:text-text-primary max-w-full text-center break-words">
            {invite.tutor.display_name}
          </p>
          <span className="text-s-base text-text-secondary dark:text-text-secondary">
            {invite.tutor.username}
          </span>
        </div>
      </div>

      {errorVariant && errorVariant !== 'already_connected' && errorVariant !== 'self_invite' ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-text-primary dark:text-text-primary">
            {errorVariant === 'not_found' ? t('error.notFoundTitle') : t('error.genericTitle')}
          </p>
          <p className="text-text-secondary dark:text-text-secondary text-sm">
            {errorVariant === 'not_found'
              ? t('error.notFoundDescription')
              : errorVariant === 'network'
                ? t('error.networkDescription')
                : t('error.genericDescription')}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col justify-center gap-2">
        {errorVariant === 'not_found' ? null : (
          <Button
            className="h-auto min-h-12 w-full rounded-xl whitespace-normal"
            onClick={
              errorVariant === 'network' || errorVariant === 'generic' ? retryAccept : acceptInvite
            }
            loading={isPending}
            disabled={isPending}
            data-umami-event="invite-accept"
            data-umami-event-kind={invite.kind}
          >
            {isPending
              ? t('actions.accepting')
              : errorVariant
                ? t('actions.retry')
                : t('actions.accept')}
          </Button>
        )}
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
