import { useNavigate, useParams } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { InviteT } from '../types';
import { useAcceptInvite } from '../services';

export const Invite = ({ invite }: { invite: InviteT }) => {
  const navigate = useNavigate();
  const { inviteId } = useParams({ strict: false }) as { inviteId: string };
  const { mutate } = useAcceptInvite();

  const isInviteAccepted =
    (invite.kind === 'individual' && invite.existing_classroom_id) ||
    (invite.kind === 'group' && invite.has_already_joined);

  const getInviteTitle = () =>
    isInviteAccepted ? 'Приглашение принято' : 'Вы получили приглашение';

  const getAcceptButtonText = () => (isInviteAccepted ? 'Перейти в кабинет' : 'Принять');

  const acceptInvite = () => {
    if (invite.kind === 'group') {
      if (invite.has_already_joined) {
        if (invite.classroom?.id) {
          navigate({ to: `/classrooms/${invite.classroom.id}` });
        } else {
          navigate({ to: `/classrooms` });
        }
      } else {
        mutate(inviteId); // первое принятие приглашения
      }
    }

    if (invite.kind === 'individual') {
      if (invite.existing_classroom_id) {
        navigate({ to: `/classrooms/${invite.existing_classroom_id}` }); // Переход по старому приглашению в индивидуальный кабинет
      } else {
        mutate(inviteId); // первое принятие приглашения
      }
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 p-2 sm:w-[500px]">
      <div className="text-center">
        <h3 className="text-xl-base mb-2 font-semibold">{getInviteTitle()}</h3>
        <span>
          {invite.kind === 'individual'
            ? 'Репетитор'
            : `в группу «${invite.classroom.name}» от репетитора`}
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
          <p>{invite.tutor.display_name}</p>
          <span className="text-s-base">{invite.tutor.username}</span>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-2">
        <Button className="w-full rounded-xl" onClick={acceptInvite}>
          {getAcceptButtonText()}
        </Button>
        <Button onClick={() => navigate({ to: '/' })} className="w-full rounded-xl" variant="ghost">
          Отказаться
        </Button>
      </div>
    </div>
  );
};
