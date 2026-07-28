import { ResetPassword } from './ResetPassword';

export const ResetPasswordPage = () => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center p-1 py-4">
      <div className="xs:border xs:border-border-default xs:rounded-2xl flex h-[600px] w-full max-w-[420px] flex-col bg-transparent p-8">
        <ResetPassword />
      </div>
    </div>
  );
};
