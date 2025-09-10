import { Logo } from 'common.ui';
import { useParams } from '@tanstack/react-router';
import { Invite } from './Invite';
import { ErrorInvite } from './ErrorInvite';
import { useInvitePreview } from '../services';

export const InvitesPage = () => {
  const { inviteId } = useParams({ strict: false }) as { inviteId: string };
  const { data, error, isLoading } = useInvitePreview(inviteId);

  if (isLoading) {
    return (
      <section className="relative flex h-screen flex-col items-center justify-center">
        <div className="absolute top-24">
          <Logo />
        </div>
        <div className="flex w-full flex-col items-center gap-4 p-8 sm:w-[400px]">
          <p>Загрузка приглашения...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-screen flex-col items-center justify-center">
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
  );
};
