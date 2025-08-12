/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

const CallModule = lazy(() => import('modules.calls').then((module) => ({ default: module.Call })));

const paramsSchema = z.object({
  callId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/call/$callId')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Звонок',
      },
    ],
  }),
  component: CallPage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  beforeLoad: () => {
    // console.log('Call', context, location);
  },
});

function CallPage() {
  // @ts-ignore
  // const { callId } = Route.useParams();
  return <CallModule firstId="1" secondId="2" />;
}
