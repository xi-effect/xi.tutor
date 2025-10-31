import { useState } from 'react';
import { EmailPageConfirm } from './EmailPageConfirm';
import { EmailPageSuccess } from './EmailPageSuccess';

export const EmailPage = () => {
  const [status, setStatus] = useState<'confirm' | 'success'>('success');

  return (
    <>
      {status === 'confirm' && <EmailPageConfirm setStatus={setStatus} />}
      {status === 'success' && <EmailPageSuccess />}
    </>
  );
};
