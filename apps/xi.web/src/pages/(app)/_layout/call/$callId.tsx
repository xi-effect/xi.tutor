/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const paramsSchema = z.object({
  callId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/call/$callId')({
  component: CallPage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  beforeLoad: ({ context, location }) => {
    console.log('Call', context, location);
  },
});

function CallPage() {
  // @ts-ignore
  const { callId } = Route.useParams();
  return <div>Звонок {callId}</div>;
}
