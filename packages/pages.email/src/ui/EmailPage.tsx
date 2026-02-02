import { EmailPageConfirm } from './EmailPageConfirm';
import { EmailPageSuccess } from './EmailPageSuccess';
import { useEmailToken } from './useEmailToken';

export const EmailPage = () => {
  const emailToken = useEmailToken();
  const isConfirmPage = emailToken === 'confirm' || emailToken === undefined;

  return (
    <>
      {isConfirmPage && <EmailPageConfirm />}
      {!isConfirmPage && <EmailPageSuccess />}
    </>
  );
};
