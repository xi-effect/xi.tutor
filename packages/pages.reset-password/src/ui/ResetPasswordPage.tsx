import { ResetPassword } from './ResetPassword';

export const ResetPasswordPage = () => {
  return (
    <div className="xs:h-screen dark:bg-gray-0 flex h-[100dvh] w-screen flex-col flex-wrap content-center justify-center p-1">
      <div className="xs:border dark:bg-gray-5 xs:border-gray-10 xs:rounded-2xl flex h-[600px] w-full max-w-[420px] p-8">
        <ResetPassword />
      </div>
    </div>
  );
};
