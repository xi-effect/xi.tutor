import { useEffect } from 'react';
import { Track } from 'livekit-client';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { usePinnedTracks, useCreateLayoutContext } from '@livekit/components-react';

/**
 * Хук для автоматического удаления треков демонстрации экрана при их завершении
 * Очищает закрепление когда пользователь отключает демонстрацию экрана
 */
export const useScreenShareCleanup = (tracks: TrackReferenceOrPlaceholder[]) => {
  const layoutContext = useCreateLayoutContext();
  const focusTrack = usePinnedTracks(layoutContext)?.[0];

  useEffect(() => {
    const handleTrackUnpublished = (publication: {
      source: Track.Source;
      isSubscribed: boolean;
    }) => {
      if (publication.source === Track.Source.ScreenShare && !publication.isSubscribed) {
        // Если трек демонстрации экрана больше не активен, очищаем закрепление
        if (focusTrack && focusTrack.source === Track.Source.ScreenShare) {
          layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
        }
      }
    };

    // Слушаем события отмены публикации треков
    tracks.forEach((track) => {
      if (track.publication && track.publication.source === Track.Source.ScreenShare) {
        track.publication.on('unsubscribed', () => handleTrackUnpublished(track.publication));
      }
    });

    return () => {
      tracks.forEach((track) => {
        if (track.publication && track.publication.source === Track.Source.ScreenShare) {
          track.publication.off('unsubscribed', () => handleTrackUnpublished(track.publication));
        }
      });
    };
  }, [tracks, focusTrack, layoutContext.pin]);
};
