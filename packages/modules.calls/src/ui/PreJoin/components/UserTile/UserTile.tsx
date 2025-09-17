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
    if (!videoTrack || videoTrack.isMuted || isCameraDeniedOrPrompted) {
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
            opacity: isVideoInitiated ? 1 : 0,
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
    userChoices: { videoEnabled },
  } = usePersistentUserChoices();

  const videoEl = useRef<HTMLVideoElement>(null);
  const [isVideoInitiated, setIsVideoInitiated] = useState(false);

  // Проверяем состояние разрешений
  const isCameraDeniedOrPrompted = useCannotUseDevice('videoinput');
  const isMicrophoneDeniedOrPrompted = useCannotUseDevice('audioinput');

  // Отладочная информация
  useEffect(() => {
    console.log('UserTile debug:', {
      videoTrack: videoTrack
        ? { enabled: !videoTrack.isMuted, deviceId: videoTrack.getDeviceId() }
        : null,
      videoEnabled,
      isVideoInitiated,
      isCameraDeniedOrPrompted,
      isMicrophoneDeniedOrPrompted,
    });
  }, [
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

  // Прикрепляем видео трек к элементу с улучшенной обработкой
  useEffect(() => {
    const currentVideoEl = videoEl.current;
    const currentVideoTrack = videoTrack;

    const handleVideoLoaded = () => {
      if (currentVideoEl) {
        setIsVideoInitiated(true);
        currentVideoEl.style.opacity = '1';
      }
    };

    const handleVideoError = () => {
      console.error('Video track error');
      setIsVideoInitiated(false);
    };

    if (currentVideoEl && currentVideoTrack && videoEnabled) {
      currentVideoTrack.attach(currentVideoEl);
      currentVideoEl.addEventListener('loadedmetadata', handleVideoLoaded);
      currentVideoEl.addEventListener('error', handleVideoError);
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
      setIsVideoInitiated(false);
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
