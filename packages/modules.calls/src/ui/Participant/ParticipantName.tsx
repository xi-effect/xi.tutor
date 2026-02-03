import React from 'react';
import { Participant } from 'livekit-client';

type ParticipantNamePropsT = {
  participant?: Participant;
  id?: string | undefined; // Оставляем для обратной совместимости
  username?: string | undefined; // Оставляем для обратной совместимости
  children?: React.ReactNode;
};

export const ParticipantName = ({ participant, children }: ParticipantNamePropsT) => {
  // Получаем мета-информацию участника из LiveKit
  const getParticipantInfo = () => {
    return {
      displayName: participant?.name,
    };
  };

  const { displayName } = getParticipantInfo();

  // Если есть participant, но нет displayName, показываем загрузку
  if (participant && !displayName) {
    return <span className="bg-gray-10 h-[16px] w-full min-w-[64px] animate-pulse rounded-[4px]" />;
  }

  return (
    <span className="text-xs-base-size leading-[16px] text-gray-100">
      {children}
      {displayName || 'Unknown'}
    </span>
  );
};
