import { useCallback } from 'react';
import { useLiveKitDataChannel, useLiveKitDataChannelListener } from './useLiveKitDataChannel';
import { useCallStore } from '../store/callStore';
import { useCurrentUser } from 'common.services';

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
  const { data: currentUser } = useCurrentUser();

  const handleHandMessage = useCallback(
    (message: { type: string; payload: unknown }) => {
      if (message.type === RAISE_HAND_MESSAGE_TYPE) {
        const payload = message.payload as HandMessagePayload;
        console.log('✋ Received raise hand message:', payload);
        addRaisedHand(payload);
      } else if (message.type === LOWER_HAND_MESSAGE_TYPE) {
        const payload = message.payload as HandMessagePayload;
        console.log('🤚 Received lower hand message:', payload);
        removeRaisedHand(payload.participantId);
      }
    },
    [addRaisedHand, removeRaisedHand],
  );

  // Слушаем сообщения о поднятых руках
  useLiveKitDataChannelListener(handleHandMessage);

  const raiseHand = useCallback(() => {
    const message: HandMessagePayload = {
      participantId: currentUser?.userId || 'unknown',
      participantName: currentUser?.display_name || currentUser?.username || 'Unknown User',
      timestamp: Date.now(),
    };

    console.log('✋ Sending raise hand message:', message);
    sendMessage(RAISE_HAND_MESSAGE_TYPE, message);
    toggleHandRaised();
  }, [sendMessage, currentUser, toggleHandRaised]);

  const lowerHand = useCallback(() => {
    const message: HandMessagePayload = {
      participantId: currentUser?.userId || 'unknown',
      participantName: currentUser?.display_name || currentUser?.username || 'Unknown User',
      timestamp: Date.now(),
    };

    console.log('🤚 Sending lower hand message:', message);
    sendMessage(LOWER_HAND_MESSAGE_TYPE, message);
    toggleHandRaised();
  }, [sendMessage, currentUser, toggleHandRaised]);

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
