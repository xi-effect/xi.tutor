import { Logo } from 'common.ui';
import { useParams } from '@tanstack/react-router';
import { mockInvites } from '../mocks';
import { useEffect, useState } from 'react';
import { MockInviteT } from '../types';
import { Invite } from './Invite';
import { ErrorInvite } from './ErrorInvite';

const mockStatus: 'success' | 'error' = 'success';

async function getData(id: string) {
  return mockInvites.find((invite) => invite.id === id);
}

export const InvitesPage = () => {
  const status = mockStatus;
  const [invite, setInvite] = useState<MockInviteT>();
  const { inviteId } = useParams({ strict: false });

  useEffect(() => {
    if (!inviteId) return;

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
