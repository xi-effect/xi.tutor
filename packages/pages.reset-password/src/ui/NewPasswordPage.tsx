import { NewPassword } from './NewPassword';

interface NewPasswordPageProps {
  resetToken: string;
}

export const NewPasswordPage: React.FC<NewPasswordPageProps> = ({ resetToken }) => {
  const decodedToken = decodeURIComponent(resetToken);

  return (
    <div className="xs:h-screen flex h-[100dvh] w-screen flex-col flex-wrap content-center justify-center p-1">
      <div className="xs:border xs:border-gray-10 xs:rounded-2xl flex h-[600px] w-full max-w-[420px] p-8">
        <NewPassword token={decodedToken} />
      </div>
    </div>
  );
};
