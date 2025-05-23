/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/call/')({
  component: CallsList,
  beforeLoad: () => {
    // console.log('CallsList', context, location);
  },
});

function CallsList() {
  return <div>Список звонков</div>;
}
