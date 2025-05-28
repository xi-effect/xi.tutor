/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { Call } from 'modules.calls';

const paramsSchema = z.object({
  callId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/call/$callId')({
  component: CallPage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  beforeLoad: () => {
    // console.log('Call', context, location);
  },
});

function CallPage() {
  // @ts-ignore
  // const { callId } = Route.useParams();
  return <Call firstId="1" secondId="2" />;
}
