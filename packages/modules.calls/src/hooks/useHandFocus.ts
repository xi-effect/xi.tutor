import { useEffect } from 'react';
import { Track } from 'livekit-client';
import { useCallStore } from '../store/callStore';
import { useRoom } from '../providers/RoomProvider';
import { useMaybeLayoutContext } from '@livekit/components-react';

export const useHandFocus = () => {
  const { raisedHands } = useCallStore();
  const { room } = useRoom();
  const layoutContext = useMaybeLayoutContext();

  useEffect(() => {
    if (!room || raisedHands.length === 0 || !layoutContext?.pin.dispatch) return;

    // Находим участника с самой ранней поднятой рукой
    const earliestHand = raisedHands.reduce((earliest, current) =>
      current.timestamp < earliest.timestamp ? current : earliest,
    );

    // Ищем участника в комнате
    const participant = room.getParticipantByIdentity(earliestHand.participantId);

    if (participant) {
      console.log(
        '🎯 Auto-focusing on participant with raised hand:',
        earliestHand.participantName,
      );

      // Находим трек камеры участника для фокуса
      const cameraTrack = Array.from(participant.videoTrackPublications.values()).find(
        (track) => track.source === 'camera',
      );

      if (cameraTrack) {
        // Устанавливаем фокус на участника с поднятой рукой
        layoutContext.pin.dispatch({
          msg: 'set_pin',
          trackReference: {
            participant,
            source: Track.Source.Camera,
            publication: cameraTrack,
          },
        });
      }
    } else {
      console.log('⚠️ Participant not found:', earliestHand.participantId);
    }
  }, [raisedHands, room, layoutContext]);
};
