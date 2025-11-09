import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { InvitesPage as Invite } from 'pages.invites';
import { Suspense } from 'react';
import { z } from 'zod';

const paramsSchema = z.object({
  inviteId: z.string(),
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Route = createFileRoute('/(common)/_layout/invite/$inviteId')({
  component: InvitePage,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
