import { Logo } from 'common.ui';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { useNavigate, useParams } from '@tanstack/react-router';
import { mockInvites, MockInviteT } from '../mocks';
import { useEffect, useState } from 'react';

const mockStatus: 'success' | 'error' = 'success';

async function getData(id: number) {
  return mockInvites[id];
}

export const InvitesPage = () => {
  const status = mockStatus;
  const [invite, setInvite] = useState<MockInviteT>();
  const { inviteId } = useParams({ strict: false });

  useEffect(() => {
    getData(inviteId).then((mockInvite) => setInvite(mockInvite));
  }, [inviteId]);

  return (
    <section className="relative flex h-screen flex-col items-center justify-center">
      <div className="absolute top-24">
        <Logo />
      </div>
      {status === 'success' && invite ? <Invite invite={invite} /> : <ErrorInvite />}
    </section>
  );
};

const Invite = ({ invite }: { invite: MockInviteT }) => {
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

const ErrorInvite = () => {
  return (
    <div className="flex w-full flex-col gap-4 p-8 text-center sm:w-[400px]">
      <h4 className="text-xl-base font-semibold">Приглашение недействительно :(</h4>
      <span>Обратитесь к репетитору за новым приглашением</span>
    </div>
  );
};
