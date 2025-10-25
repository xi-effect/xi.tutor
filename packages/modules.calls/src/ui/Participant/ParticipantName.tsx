import React from 'react';
import { Participant } from 'livekit-client';

type ParticipantNamePropsT = {
  participant?: Participant;
  id?: string | undefined; // Оставляем для обратной совместимости
  username?: string | undefined; // Оставляем для обратной совместимости
  children?: React.ReactNode;
};

export const ParticipantName = ({ participant, id, username, children }: ParticipantNamePropsT) => {
  // Получаем мета-информацию участника из LiveKit
  const getParticipantInfo = () => {
    if (participant) {
      try {
        // Парсим метаданные участника
        const metadata = participant.metadata;
        if (metadata) {
          const userInfo = JSON.parse(metadata);
          return {
            displayName: userInfo?.display_name || userInfo?.name || userInfo?.username,
            userId: userInfo?.user_id || userInfo?.id,
          };
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse participant metadata:', error);
      }

      // Если метаданные недоступны, используем стандартные поля LiveKit
      return {
        displayName: participant.name || participant.identity,
        userId: participant.identity,
      };
    }

    // Fallback для обратной совместимости
    return {
      displayName: username,
      userId: id,
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
