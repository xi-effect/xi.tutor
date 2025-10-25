import { useCallback } from 'react';
import { useLiveKitDataChannel, useLiveKitDataChannelListener } from './useLiveKitDataChannel';
import { useCallStore } from '../store/callStore';
import { useRoom } from '../providers/RoomProvider';

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
          console.log('✋ Received raise hand message:', payload);
          addRaisedHand(payload);
        } else if (message.type === LOWER_HAND_MESSAGE_TYPE) {
          const payload = message.payload as HandMessagePayload;
          console.log('🤚 Received lower hand message:', payload);
          removeRaisedHand(payload.participantId);
        }
      } catch (error) {
        console.error('❌ Error handling hand message:', error);
      }
    },
    [addRaisedHand, removeRaisedHand],
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

    console.log('✋ Sending raise hand message:', message);
    sendMessage(RAISE_HAND_MESSAGE_TYPE, message);
    toggleHandRaised();
  }, [sendMessage, getCurrentParticipantInfo, toggleHandRaised]);

  const lowerHand = useCallback(() => {
    const participantInfo = getCurrentParticipantInfo();
    const message: HandMessagePayload = {
      participantId: participantInfo.participantId,
      participantName: participantInfo.participantName,
      timestamp: Date.now(),
    };

    console.log('🤚 Sending lower hand message:', message);
    sendMessage(LOWER_HAND_MESSAGE_TYPE, message);
    toggleHandRaised();
  }, [sendMessage, getCurrentParticipantInfo, toggleHandRaised]);

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
