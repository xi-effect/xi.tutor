import { useMemo } from 'react';
import { Track, RoomEvent } from 'livekit-client';
import { useTracks } from '@livekit/components-react';
import { useRoom } from '../providers/RoomProvider';
import type { TrackReference } from '@livekit/components-core';
import { isTrackReference } from '@livekit/components-core';

export const useSpeakingParticipant = (): TrackReference | null => {
  const { room } = useRoom();

  // Получаем все треки камеры
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }], {
    updateOnlyOn: [RoomEvent.ActiveSpeakersChanged],
    onlySubscribed: true,
  });

  // Находим говорящего участника
  const speakingParticipant = useMemo(() => {
    if (!room || cameraTracks.length === 0) return null;

    // Фильтруем только реальные треки (не placeholder)
    const realTracks = cameraTracks.filter(isTrackReference);

    // Получаем активных спикеров из комнаты
    const activeSpeakers = room.activeSpeakers;

    if (activeSpeakers.length === 0) {
      // Если нет активных спикеров, возвращаем первого участника с видео
      const firstVideoTrack = realTracks.find(
        (track) => track.publication?.isSubscribed && !track.publication?.track?.isMuted,
      );
      return firstVideoTrack || null;
    }

    // Находим трек первого активного спикера
    const speakingTrack = realTracks.find(
      (track) =>
        track.participant.identity === activeSpeakers[0].identity &&
        track.publication?.isSubscribed &&
        !track.publication?.track?.isMuted,
    );

    return speakingTrack || null;
  }, [room, cameraTracks]);

  return speakingParticipant;
};
