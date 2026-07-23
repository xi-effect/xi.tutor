import { Navigate } from '@tanstack/react-router';

import { useResetPasswordToken } from './useResetPasswordToken';
import { NewPassword } from './NewPassword';

export const NewPasswordPage = () => {
  const decodedToken = useResetPasswordToken();

  if (!decodedToken) {
    return <Navigate to="/reset-password" />;
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center p-1 py-4">
      <div className="xs:border xs:border-gray-10 xs:rounded-2xl flex h-[600px] w-full max-w-[420px] flex-col bg-transparent p-8">
        <NewPassword token={decodedToken} />
      </div>
    </div>
  );
};
