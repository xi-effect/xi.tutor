import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { MockInviteT } from '../types';

export const Invite = ({ invite }: { invite: MockInviteT }) => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col gap-8 p-2 sm:w-[500px]">
      <div className="text-center">
        <h3 className="text-xl-base mb-2 font-semibold">Вы получили приглашение</h3>
        <span>{invite.type === 'group' ? 'Группа' : 'Репетитор'}</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar size="xl">
          <AvatarImage src={invite.avatarUrl || ''} alt="user avatar" />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col items-center">
          <p>{invite.name}</p>
          <span className="text-s-base">{invite.info}</span>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-2">
        <Button className="w-full rounded-xl">Принять</Button>
        <Button onClick={() => navigate({ to: '/' })} className="w-full rounded-xl" variant="ghost">
          Отказаться
        </Button>
      </div>
    </div>
  );
};
