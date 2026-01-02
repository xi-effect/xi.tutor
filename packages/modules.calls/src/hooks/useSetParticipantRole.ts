import { useEffect } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { useCurrentUser } from 'common.services';
import { useRoom } from '../providers/RoomProvider';

/**
 * Хук для установки роли участника в LiveKit на основе default_layout пользователя
 * Устанавливает role: 'tutor' для репетиторов при подключении к ВКС
 */
export const useSetParticipantRole = () => {
  const { localParticipant } = useLocalParticipant();
  const { data: user } = useCurrentUser();
  const { room } = useRoom();

  useEffect(() => {
    // Проверяем, что комната подключена и localParticipant доступен
    if (!room || room.state !== 'connected' || !localParticipant || !user) {
      return;
    }

    console.log('user.default_layout', user.default_layout);

    // Проверяем, является ли пользователь репетитором
    if (user.default_layout === 'tutor') {
      // Устанавливаем атрибут роли для репетитора
      localParticipant
        .setAttributes({ role: 'tutor' })
        .then(() => {
          console.log('✅ Participant role set to "tutor"');
        })
        .catch((error) => {
          console.warn('⚠️ Failed to set participant role:', error);
        });
    }
  }, [room, localParticipant, user]);
};
