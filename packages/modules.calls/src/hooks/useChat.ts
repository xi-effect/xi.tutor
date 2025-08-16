import { useCallback } from 'react';
import { useLiveKitDataChannel, useLiveKitDataChannelListener } from './useLiveKitDataChannel';
import { useCallStore } from '../store/callStore';
import { useCurrentUser } from 'common.services';

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
  const { data: currentUser } = useCurrentUser();

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

      const message: ChatMessagePayload = {
        id: `${Date.now()}-${Math.random()}`,
        text: text.trim(),
        senderId: currentUser?.userId || 'unknown',
        senderName: currentUser?.display_name || currentUser?.username || 'Unknown User',
        timestamp: Date.now(),
      };

      console.log('📤 Sending chat message:', message);
      sendMessage(CHAT_MESSAGE_TYPE, message);
    },
    [sendMessage, currentUser],
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
