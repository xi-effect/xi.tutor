import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { useMemo, useRef, useEffect, useState } from 'react';
import { facingModeFromLocalTrack, LocalVideoTrack, LocalAudioTrack } from 'livekit-client';
import { Controls } from './Controls';
import { useCurrentUser } from 'common.services';
import { usePersistentUserChoices } from '../../../../hooks/usePersistentUserChoices';
import { useCannotUseDevice } from '../../../../hooks/useCannotUseDevice';
import { openPermissionsDialog } from '../../../../store/permissions';
import { Button } from '@xipkg/button';

const UserTileUI = ({
  audioTrack,
  videoTrack,
  videoEnabled,
  facingMode,
  videoEl,
  userId,
  isCameraDeniedOrPrompted,
  isMicrophoneDeniedOrPrompted,
  isVideoInitiated,
}: {
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
  videoEnabled: boolean;
  facingMode: string;
  videoEl: React.RefObject<HTMLVideoElement | null>;
  userId: string;
  isCameraDeniedOrPrompted: boolean;
  isMicrophoneDeniedOrPrompted: boolean;
  isVideoInitiated: boolean;
}) => {
  const hintMessage = useMemo(() => {
    if (isCameraDeniedOrPrompted) {
      return isMicrophoneDeniedOrPrompted
        ? 'Камера и микрофон не разрешены'
        : 'Камера не разрешена';
    }
    if (!videoEnabled) {
      return 'Камера отключена';
    }
    if (!isVideoInitiated) {
      return 'Запуск камеры...';
    }
    if (videoTrack && videoEnabled) {
      return '';
    }
    return 'Камера недоступна';
  }, [
    videoTrack,
    videoEnabled,
    isCameraDeniedOrPrompted,
    isMicrophoneDeniedOrPrompted,
    isVideoInitiated,
  ]);

  const permissionsButtonLabel = useMemo(() => {
    if (!isMicrophoneDeniedOrPrompted && !isCameraDeniedOrPrompted) {
      return null;
    }
    if (isCameraDeniedOrPrompted && isMicrophoneDeniedOrPrompted) {
      return 'Разрешить камеру и микрофон';
    }
    if (isCameraDeniedOrPrompted && !isMicrophoneDeniedOrPrompted) {
      return 'Разрешить камеру';
    }
    return null;
  }, [isMicrophoneDeniedOrPrompted, isCameraDeniedOrPrompted]);

  const renderVideo = useMemo(() => {
    console.log('UserTile: renderVideo check', {
      hasTrack: !!videoTrack,
      isMuted: videoTrack?.isMuted,
      isCameraDeniedOrPrompted,
      videoEnabled,
      isVideoInitiated,
    });

    // Рендерим видео элемент всегда, если есть трек и камера не заблокирована
    // Скрываем его через стили, если нужно
    if (!videoTrack || isCameraDeniedOrPrompted) {
      console.log('UserTile: not rendering video - no track or camera denied');
      return null;
    }

    return (
      <div className="aspect-video h-full w-full [transform:rotateY(180deg)]">
        <video
          ref={videoEl}
          data-lk-facing-mode={facingMode}
          className="h-full w-full object-cover"
          playsInline
          muted
          style={{
            display: !videoEnabled || isCameraDeniedOrPrompted ? 'none' : undefined,
            opacity: videoTrack?.isMuted || !isVideoInitiated ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
          disablePictureInPicture
          disableRemotePlayback
        />
      </div>
    );
  }, [videoTrack, facingMode, videoEl, videoEnabled, isCameraDeniedOrPrompted, isVideoInitiated]);

  const renderAvatar = useMemo(() => {
    if (videoTrack && !videoTrack.isMuted && !isCameraDeniedOrPrompted) return null;

    return (
      <div className="bg-gray-40 flex items-center justify-center rounded-[16px]">
        <Avatar size="xxl">
          <AvatarImage
            src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
            alt="user avatar"
          />
          <AvatarFallback size="xxl" loading />
        </Avatar>
      </div>
    );
  }, [videoTrack, userId, isCameraDeniedOrPrompted]);

  return (
    <div className="bg-gray-40 relative flex aspect-video h-full w-full items-center justify-center overflow-hidden rounded-[16px]">
      <div className="relative h-full w-full">
        {renderVideo}
        {renderAvatar}

        {/* Сообщения о состоянии камеры */}
        {hintMessage && (
          <div className="bg-opacity-60 absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center">
            <p className="text-lg font-normal text-white">{hintMessage}</p>
            {isCameraDeniedOrPrompted && permissionsButtonLabel && (
              <Button size="sm" variant="secondary" onClick={openPermissionsDialog}>
                {permissionsButtonLabel}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-5 left-5">
        <Controls audioTrack={audioTrack} videoTrack={videoTrack} />
      </div>
    </div>
  );
};

interface UserTileProps {
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
}

export const UserTile = ({ audioTrack, videoTrack }: UserTileProps) => {
  const { data: user } = useCurrentUser();
  const { userId } = user;

  const {
    userChoices: { videoEnabled, audioEnabled },
  } = usePersistentUserChoices();

  const videoEl = useRef<HTMLVideoElement>(null);
  const [isVideoInitiated, setIsVideoInitiated] = useState(false);
  const [isAudioInitiated, setIsAudioInitiated] = useState(false);

  // Проверяем состояние разрешений
  const isCameraDeniedOrPrompted = useCannotUseDevice('videoinput');
  const isMicrophoneDeniedOrPrompted = useCannotUseDevice('audioinput');

  // Отладочная информация
  useEffect(() => {
    console.log('UserTile debug:', {
      audioTrack: audioTrack
        ? {
            enabled: !audioTrack.isMuted,
            deviceId: audioTrack.getDeviceId(),
            muted: audioTrack.isMuted,
          }
        : null,
      audioEnabled,
      isAudioInitiated,
      videoTrack: videoTrack
        ? {
            enabled: !videoTrack.isMuted,
            deviceId: videoTrack.getDeviceId(),
            muted: videoTrack.isMuted,
          }
        : null,
      videoEnabled,
      isVideoInitiated,
      isCameraDeniedOrPrompted,
      isMicrophoneDeniedOrPrompted,
    });
  }, [
    audioTrack,
    audioEnabled,
    isAudioInitiated,
    videoTrack,
    videoEnabled,
    isVideoInitiated,
    isCameraDeniedOrPrompted,
    isMicrophoneDeniedOrPrompted,
  ]);

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

  // Сбрасываем isAudioInitiated только при изменении audioEnabled на false
  useEffect(() => {
    if (!audioEnabled) {
      console.log('UserTile: audio disabled, setting isAudioInitiated to false');
      setIsAudioInitiated(false);
    }
    // Не устанавливаем true здесь, так как это делается в обработчиках событий трека
  }, [audioEnabled]);

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

  // Отслеживаем изменение состояния muted аудио трека
  useEffect(() => {
    if (audioTrack) {
      const handleAudioTrackMuted = () => {
        console.log('UserTile: audio track muted, setting isAudioInitiated to false');
        setIsAudioInitiated(false);
      };

      const handleAudioTrackUnmuted = () => {
        // Устанавливаем true только если audioEnabled тоже true
        if (audioEnabled) {
          console.log(
            'UserTile: audio track unmuted and audio enabled, setting isAudioInitiated to true',
          );
          setIsAudioInitiated(true);
        } else {
          console.log(
            'UserTile: audio track unmuted but audio disabled, keeping isAudioInitiated false',
          );
        }
      };

      audioTrack.on('muted', handleAudioTrackMuted);
      audioTrack.on('unmuted', handleAudioTrackUnmuted);

      return () => {
        audioTrack.off('muted', handleAudioTrackMuted);
        audioTrack.off('unmuted', handleAudioTrackUnmuted);
      };
    }
  }, [audioTrack, audioEnabled]);

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
    />
  );
};
