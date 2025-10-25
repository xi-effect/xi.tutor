import { useCallback } from 'react';
import { useLiveKitDataChannel, useLiveKitDataChannelListener } from './useLiveKitDataChannel';
import { useCallStore } from '../store/callStore';
import { useRoom } from '../providers/RoomProvider';

const CHAT_MESSAGE_TYPE = 'chat_message';

type ChatMessagePayload = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
};

export const useChat = () => {
  const { sendMessage } = useLiveKitDataChannel();
  const { addChatMessage, clearUnreadMessages, updateStore } = useCallStore();
  const { room } = useRoom();

  // Получаем информацию о текущем участнике из LiveKit
  const getCurrentParticipantInfo = useCallback(() => {
    if (!room?.localParticipant) {
      return {
        senderId: 'unknown',
        senderName: 'Unknown User',
      };
    }

    const participant = room.localParticipant;

    try {
      // Парсим метаданные участника
      const metadata = participant.metadata;
      if (metadata) {
        const userInfo = JSON.parse(metadata);
        return {
          senderId: userInfo?.user_id || userInfo?.id || participant.identity,
          senderName:
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
      senderId: participant.identity,
      senderName: participant.name || participant.identity,
    };
  }, [room]);

  const handleChatMessage = useCallback(
    (message: { type: string; payload: unknown }) => {
      if (message.type === CHAT_MESSAGE_TYPE) {
        const payload = message.payload as ChatMessagePayload;
        console.log('💬 Received chat message:', payload);
        addChatMessage(payload);
      }
    },
    [addChatMessage],
  );

  // Слушаем сообщения чата
  useLiveKitDataChannelListener(handleChatMessage);

  const sendChatMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const participantInfo = getCurrentParticipantInfo();
      const message: ChatMessagePayload = {
        id: `${Date.now()}-${Math.random()}`,
        text: text.trim(),
        senderId: participantInfo.senderId,
        senderName: participantInfo.senderName,
        timestamp: Date.now(),
      };

      console.log('📤 Sending chat message:', message);
      sendMessage(CHAT_MESSAGE_TYPE, message);
    },
    [sendMessage, getCurrentParticipantInfo],
  );

  const toggleChat = useCallback(() => {
    updateStore('isChatOpen', !useCallStore.getState().isChatOpen);
    clearUnreadMessages();
  }, [updateStore, clearUnreadMessages]);

  const openChat = useCallback(() => {
    updateStore('isChatOpen', true);
    clearUnreadMessages();
  }, [updateStore, clearUnreadMessages]);

  const closeChat = useCallback(() => {
    updateStore('isChatOpen', false);
  }, [updateStore]);

  return {
    sendChatMessage,
    toggleChat,
    openChat,
    closeChat,
  };
};
