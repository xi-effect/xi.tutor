import { EmailPageConfirm } from './EmailPageConfirm';
import { EmailPageSuccess } from './EmailPageSuccess';
import { useParams } from '@tanstack/react-router';

export const EmailPage = () => {
  const { emailId } = useParams({ strict: false });

  return (
    <>
      {emailId === 'confirm' && <EmailPageConfirm />}
      {emailId !== 'confirm' && <EmailPageSuccess />}
    </>
  );
};
