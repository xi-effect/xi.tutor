import { Logo } from 'common.ui';
import { useParams } from '@tanstack/react-router';
import { useEffect } from 'react';
import { SupportPageShell } from 'modules.navigation';
import { Invite } from './Invite';
import { ErrorInvite } from './ErrorInvite';
import { useInvitePreview } from '../services';

export const InvitesPage = () => {
  const { inviteId } = useParams({ strict: false }) as { inviteId: string };
  const { data, error, isLoading } = useInvitePreview(inviteId);

  useEffect(() => {
    localStorage.removeItem('invite.pending_code');
  }, []);

  if (isLoading) {
    return (
      <SupportPageShell>
        <section className="relative flex flex-1 flex-col items-center justify-center py-24">
          <div className="absolute top-24">
            <Logo />
          </div>
          <div className="flex w-full flex-col items-center gap-4 p-8 sm:w-[400px]">
            <p className="text-gray-80 dark:text-gray-80">Загрузка приглашения...</p>
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
          <ErrorInvite error="Приглашение не найдено" />
        )}
      </section>
    </SupportPageShell>
  );
};
