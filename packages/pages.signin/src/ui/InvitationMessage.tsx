import React from 'react';

interface InvitationMessageProps {
  communityName: string;
}

export const InvitationMessage: React.FC<InvitationMessageProps> = ({ communityName }) => (
  <div className="bg-bkgd-main rounded-lg p-4">
    <p className="text-brand-100 text-sm">
      Вы были приглашены в сообщество «{communityName}». Для того, чтобы продолжить, авторизуйтесь
      или зарегистрируйтесь.
    </p>
  </div>
);
