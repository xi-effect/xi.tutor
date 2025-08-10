import { useEffect, useCallback } from 'react';
import { RoomEvent, RemoteParticipant } from 'livekit-client';
import { useRoom } from '../providers/RoomProvider';

type DataMessage = {
  type: string;
  payload: unknown;
  timestamp: number;
};

type UseLiveKitDataChannelReturn = {
  sendMessage: (type: string, payload: unknown) => void;
  sendMessageToParticipant: (participantId: string, type: string, payload: unknown) => void;
};

export const useLiveKitDataChannel = (): UseLiveKitDataChannelReturn => {
  const { room } = useRoom();

  const sendMessage = useCallback(
    (type: string, payload: unknown) => {
      if (!room) {
        console.warn('⚠️ Room is not available for sending data message');
        return;
      }

      const message: DataMessage = {
        type,
        payload,
        timestamp: Date.now(),
      };

      try {
        console.log('📤 Sending data message:', message);
        room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(message)), {
          reliable: true,
        });
        console.log('✅ Data message sent successfully');
      } catch (error) {
        console.error('❌ Failed to send data message:', error);
      }
    },
    [room],
  );

  const sendMessageToParticipant = useCallback(
    (participantId: string, type: string, payload: unknown) => {
      if (!room) {
        console.warn('⚠️ Room is not available for sending data message');
        return;
      }

      const message: DataMessage = {
        type,
        payload,
        timestamp: Date.now(),
      };

      try {
        console.log('📤 Sending data message to participant:', participantId, message);
        room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(message)), {
          reliable: true,
          destinationIdentities: [participantId],
        });
        console.log('✅ Data message sent to participant successfully');
      } catch (error) {
        console.error('❌ Failed to send data message to participant:', error);
      }
    },
    [room],
  );

  return {
    sendMessage,
    sendMessageToParticipant,
  };
};

export const useLiveKitDataChannelListener = (
  onMessage: (message: DataMessage, participant?: RemoteParticipant) => void,
) => {
  const { room } = useRoom();

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const message: DataMessage = JSON.parse(new TextDecoder().decode(payload));
        console.log('📥 Data message received:', message, 'from:', participant?.identity);
        onMessage(message, participant);
      } catch (error) {
        console.error('❌ Failed to parse data message:', error);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, onMessage]);
};
