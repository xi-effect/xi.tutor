import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { InvitesPage as Invite } from 'pages.invites';
import { Suspense } from 'react';
import { z } from 'zod';

const paramsSchema = z.object({
  inviteId: z.string(),
});

export const Route = createFileRoute('/(app)/invite/$inviteId')({
  component: InvitePage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  // beforeLoad: ({ context, location }) => {
  //   console.log('Invites', context, location);
  // },
});

function InvitePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Invite />;
    </Suspense>
  );
}
