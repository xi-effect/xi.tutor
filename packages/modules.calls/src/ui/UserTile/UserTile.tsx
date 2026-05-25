import { useMemo, useRef, useEffect, useState } from 'react';
import { facingModeFromLocalTrack, LocalVideoTrack, LocalAudioTrack } from 'livekit-client';
import { useCurrentUser } from 'common.services';
import { usePersistentUserChoices } from '../../hooks/usePersistentUserChoices';
import { useCannotUseDevice } from '../../hooks/useCannotUseDevice';
import { UserTileUI } from './UserTileUI';

interface UserTileProps {
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
  disableMicroToggle?: boolean;
}

export const UserTile = ({ audioTrack, videoTrack, disableMicroToggle = false }: UserTileProps) => {
  const { data: user } = useCurrentUser();
  const { userId } = user;

  const {
    userChoices: { videoEnabled },
  } = usePersistentUserChoices();

  const videoEl = useRef<HTMLVideoElement>(null);
  const [isVideoInitiated, setIsVideoInitiated] = useState(false);

  // Проверяем состояние разрешений
  const isCameraDeniedOrPrompted = useCannotUseDevice('videoinput');
  const isMicrophoneDeniedOrPrompted = useCannotUseDevice('audioinput');

  const facingMode = useMemo(() => {
    if (videoTrack) {
      const { facingMode } = facingModeFromLocalTrack(videoTrack);
      return facingMode;
    }
    return 'undefined';
  }, [videoTrack]);

  // Сбрасываем isVideoInitiated только при изменении videoEnabled на false
  useEffect(() => {
    if (!videoEnabled) {
      console.log('UserTile: video disabled, setting isVideoInitiated to false');
      setIsVideoInitiated(false);
    }
    // Не устанавливаем true здесь, так как это делается в обработчиках событий трека
  }, [videoEnabled]);

  // Отслеживаем изменение состояния muted трека
  useEffect(() => {
    if (videoTrack) {
      const handleTrackMuted = () => {
        console.log('UserTile: track muted, setting isVideoInitiated to false');
        setIsVideoInitiated(false);
      };

      const handleTrackUnmuted = () => {
        // Устанавливаем true только если videoEnabled тоже true
        if (videoEnabled) {
          console.log(
            'UserTile: track unmuted and video enabled, setting isVideoInitiated to true',
          );
          setIsVideoInitiated(true);
          // Трек уже прикреплен к элементу, просто обновляем opacity через стили
        } else {
          console.log('UserTile: track unmuted but video disabled, keeping isVideoInitiated false');
        }
      };

      videoTrack.on('muted', handleTrackMuted);
      videoTrack.on('unmuted', handleTrackUnmuted);

      return () => {
        videoTrack.off('muted', handleTrackMuted);
        videoTrack.off('unmuted', handleTrackUnmuted);
      };
    }
  }, [videoTrack, videoEnabled]);

  // Прикрепляем видео трек к элементу с улучшенной обработкой
  useEffect(() => {
    const currentVideoEl = videoEl.current;
    const currentVideoTrack = videoTrack;

    const handleVideoLoaded = () => {
      if (currentVideoEl && videoEnabled) {
        console.log('UserTile: video loaded and enabled, setting isVideoInitiated to true');
        setIsVideoInitiated(true);
        currentVideoEl.style.opacity = '1';
      } else if (currentVideoEl) {
        console.log('UserTile: video loaded but disabled, keeping isVideoInitiated false');
        currentVideoEl.style.opacity = '0';
      }
    };

    const handleVideoError = () => {
      console.error('Video track error');
      setIsVideoInitiated(false);
    };

    if (currentVideoEl && currentVideoTrack && videoEnabled) {
      console.log('UserTile: attaching video track', {
        videoEnabled,
        isMuted: currentVideoTrack.isMuted,
        hasElement: !!currentVideoEl,
      });
      currentVideoTrack.attach(currentVideoEl);
      currentVideoEl.addEventListener('loadedmetadata', handleVideoLoaded);
      currentVideoEl.addEventListener('error', handleVideoError);
    } else {
      console.log('UserTile: not attaching video track', {
        hasElement: !!currentVideoEl,
        hasTrack: !!currentVideoTrack,
        videoEnabled,
        isMuted: currentVideoTrack?.isMuted,
      });
    }

    return () => {
      if (currentVideoTrack) {
        currentVideoTrack.detach();
      }
      if (currentVideoEl) {
        currentVideoEl.removeEventListener('loadedmetadata', handleVideoLoaded);
        currentVideoEl.removeEventListener('error', handleVideoError);
        currentVideoEl.style.opacity = '0';
      }
      // Не сбрасываем isVideoInitiated здесь, так как это может происходить при переподключении
    };
  }, [videoTrack, videoEnabled]);

  return (
    <UserTileUI
      audioTrack={audioTrack}
      videoTrack={videoTrack}
      videoEnabled={videoEnabled}
      facingMode={facingMode}
      videoEl={videoEl}
      userId={userId || 'unknown'}
      isCameraDeniedOrPrompted={isCameraDeniedOrPrompted}
      isMicrophoneDeniedOrPrompted={isMicrophoneDeniedOrPrompted}
      isVideoInitiated={isVideoInitiated}
      disableMicroToggle={disableMicroToggle}
    />
  );
};
