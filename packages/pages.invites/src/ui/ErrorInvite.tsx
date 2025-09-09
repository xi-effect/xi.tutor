interface ErrorInviteProps {
  error: Error | string;
}

export const ErrorInvite = ({ error }: ErrorInviteProps) => {
  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message === 'Target is the source') {
      return 'Преподаватель не может принять собственное приглашение';
    }

    return error.message || 'Приглашение недействительно';
  };

  const getErrorDescription = () => {
    if (error instanceof Error && error.message === 'Target is the source') {
      return 'Вы не можете присоединиться к собственному кабинету';
    }
    return 'Обратитесь к репетитору за новым приглашением';
  };

  return (
    <div className="flex w-full flex-col gap-4 p-8 text-center sm:w-[400px]">
      <h4 className="text-xl-base font-semibold">{getErrorMessage()}</h4>
      <span>{getErrorDescription()}</span>
    </div>
  );
};
