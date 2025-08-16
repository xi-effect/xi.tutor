import { useEffect } from 'react';
import { RemoteParticipant } from 'livekit-client';
import { useCallStore } from '../store/callStore';
import { useRoom } from '../providers/RoomProvider';

export const useHandFocus = () => {
  const { raisedHands } = useCallStore();
  const { room } = useRoom();

  useEffect(() => {
    if (!room || raisedHands.length === 0) return;

    // Находим участника с самой ранней поднятой рукой
    const earliestHand = raisedHands.reduce((earliest, current) =>
      current.timestamp < earliest.timestamp ? current : earliest,
    );

    // Ищем участника в комнате - используем правильный API LiveKit 2.x
    const participant = room.getParticipantByIdentity(earliestHand.participantId);

    if (participant) {
      console.log(
        '🎯 Auto-focusing on participant with raised hand:',
        earliestHand.participantName,
      );
      console.log('📺 Participant found:', participant.identity);
    } else {
      console.log('⚠️ Participant not found:', earliestHand.participantId);
      // Получаем список всех участников для отладки
      const allParticipants = Array.from(room.remoteParticipants.values());
      console.log(
        '📋 Available participants:',
        allParticipants.map((p: RemoteParticipant) => p.identity),
      );
    }
  }, [raisedHands, room]);
};
