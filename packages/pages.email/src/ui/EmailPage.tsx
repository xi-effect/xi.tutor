import { EmailPageConfirm } from './EmailPageConfirm';
import { EmailPageSuccess } from './EmailPageSuccess';
import { isEmailWaitingScreen, useEmailToken } from './useEmailToken';

export const EmailPage = () => {
  const emailToken = useEmailToken();
  const isWaitingScreen = isEmailWaitingScreen(emailToken);

  return (
    <>
      {isWaitingScreen && <EmailPageConfirm />}
      {!isWaitingScreen && <EmailPageSuccess />}
    </>
  );
};
