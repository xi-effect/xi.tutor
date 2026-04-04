import { useCallback } from 'react';
import { useSoundEffectsStore } from 'common.ui';
import { useLiveKitDataChannel, useLiveKitDataChannelListener } from './useLiveKitDataChannel';
import { useCallStore } from '../store/callStore';
import { useRoom } from '../providers/RoomProvider';
import { playSound } from '../utils/sounds';

const RAISE_HAND_MESSAGE_TYPE = 'raise_hand';
const LOWER_HAND_MESSAGE_TYPE = 'lower_hand';

type HandMessagePayload = {
  participantId: string;
  participantName: string;
  timestamp: number;
};

export const useRaisedHands = () => {
  const { sendMessage } = useLiveKitDataChannel();
  const { addRaisedHand, removeRaisedHand, toggleHandRaised } = useCallStore();
  const handRaiseSoundVolume = useSoundEffectsStore((s) => s.handRaiseVolume);
  const { room } = useRoom();

  // Получаем информацию о текущем участнике из LiveKit
  const getCurrentParticipantInfo = useCallback(() => {
    if (!room?.localParticipant) {
      return {
        participantId: 'unknown',
        participantName: 'Unknown User',
      };
    }

    const participant = room.localParticipant;

    try {
      // Парсим метаданные участника
      const metadata = participant.metadata;
      if (metadata) {
        const userInfo = JSON.parse(metadata);
        return {
          participantId: userInfo?.user_id || userInfo?.id || participant.identity,
          participantName:
            userInfo?.display_name ||
            userInfo?.name ||
            userInfo?.username ||
            participant.name ||
            participant.identity,
        };
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse participant metadata:', error);
    }

    // Fallback на стандартные поля LiveKit
    return {
      participantId: participant.identity,
      participantName: participant.name || participant.identity,
    };
  }, [room]);

  const handleHandMessage = useCallback(
    (message: { type: string; payload: unknown }) => {
      try {
        if (message.type === RAISE_HAND_MESSAGE_TYPE) {
          const payload = message.payload as HandMessagePayload;

          // Проверяем, не от текущего пользователя ли сообщение
          const currentParticipantInfo = getCurrentParticipantInfo();
          if (payload.participantId !== currentParticipantInfo.participantId) {
            addRaisedHand(payload);

            // Воспроизводим звук уведомления о поднятии руки
            playSound('handRaise', handRaiseSoundVolume);
          }
        } else if (message.type === LOWER_HAND_MESSAGE_TYPE) {
          const payload = message.payload as HandMessagePayload;
          console.log('🤚 Received lower hand message:', payload);

          // Проверяем, не от текущего пользователя ли сообщение
          const currentParticipantInfo = getCurrentParticipantInfo();
          if (payload.participantId !== currentParticipantInfo.participantId) {
            removeRaisedHand(payload.participantId);
          }
        }
      } catch (error) {
        console.error('❌ Error handling hand message:', error);
      }
    },
    [addRaisedHand, removeRaisedHand, getCurrentParticipantInfo, handRaiseSoundVolume],
  );

  // Слушаем сообщения о поднятых руках
  useLiveKitDataChannelListener(handleHandMessage);

  const raiseHand = useCallback(() => {
    const participantInfo = getCurrentParticipantInfo();
    const message: HandMessagePayload = {
      participantId: participantInfo.participantId,
      participantName: participantInfo.participantName,
      timestamp: Date.now(),
    };

    sendMessage(RAISE_HAND_MESSAGE_TYPE, message);
    // Добавляем руку в локальный store для текущего пользователя
    addRaisedHand(message);
    toggleHandRaised();
  }, [sendMessage, getCurrentParticipantInfo, addRaisedHand, toggleHandRaised]);

  const lowerHand = useCallback(() => {
    const participantInfo = getCurrentParticipantInfo();
    const message: HandMessagePayload = {
      participantId: participantInfo.participantId,
      participantName: participantInfo.participantName,
      timestamp: Date.now(),
    };

    sendMessage(LOWER_HAND_MESSAGE_TYPE, message);
    // Удаляем руку из локального store для текущего пользователя
    removeRaisedHand(participantInfo.participantId);
    toggleHandRaised();
  }, [sendMessage, getCurrentParticipantInfo, removeRaisedHand, toggleHandRaised]);

  const toggleHand = useCallback(() => {
    const { isHandRaised } = useCallStore.getState();
    if (isHandRaised) {
      lowerHand();
    } else {
      raiseHand();
    }
  }, [raiseHand, lowerHand]);

  return {
    raiseHand,
    lowerHand,
    toggleHand,
  };
};
