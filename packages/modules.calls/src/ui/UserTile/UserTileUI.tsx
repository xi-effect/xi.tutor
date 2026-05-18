import { useMemo } from 'react';
import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { isSafari } from '../../utils/livekit';
import { openPermissionsDialog } from '../../store/permissions';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { Settings } from '@xipkg/icons';
import { SecureVideo } from '../shared';
import { Controls } from './Controls';

export const UserTileUI = ({
  audioTrack,
  videoTrack,
  videoEnabled,
  facingMode,
  videoEl,
  userId,
  isCameraDeniedOrPrompted,
  isMicrophoneDeniedOrPrompted,
  isVideoInitiated,
  disableMicroToggle = false,
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
  disableMicroToggle?: boolean;
}) => {
  const isPermissionsBlocked = isCameraDeniedOrPrompted || isMicrophoneDeniedOrPrompted;

  const hintMessage = useMemo(() => {
    if (isPermissionsBlocked) {
      return null; // для блока разрешений показываем отдельный контент
    }
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
    isPermissionsBlocked,
  ]);

  const permissionsInstructions = useMemo(() => {
    if (isSafari()) {
      const origin =
        typeof window !== 'undefined'
          ? (window.location?.origin?.replace('https://', '') ?? '')
          : '';
      return [
        `Нажмите на иконку ${origin} в адресной строке`,
        'Снимите запрет на использование камеры и микрофона',
      ];
    }
    return [
      'Нажмите на значок настроек в адресной строке браузера',
      'Снимите запрет на использование камеры и микрофона',
    ];
  }, []);

  const permissionsButtonLabel = useMemo(() => {
    if (!isMicrophoneDeniedOrPrompted && !isCameraDeniedOrPrompted) {
      return null;
    }
    if (isCameraDeniedOrPrompted && isMicrophoneDeniedOrPrompted) {
      return 'Как разрешить камеру и микрофон';
    }
    if (isMicrophoneDeniedOrPrompted) {
      return 'Как разрешить микрофон';
    }
    if (isCameraDeniedOrPrompted) {
      return 'Как разрешить камеру';
    }
    return null;
  }, [isMicrophoneDeniedOrPrompted, isCameraDeniedOrPrompted]);

  const renderVideo = useMemo(() => {
    if (!videoTrack || isCameraDeniedOrPrompted) {
      return null;
    }

    return (
      <div className="aspect-video h-full w-full transform-[rotateY(180deg)]">
        <SecureVideo
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
    <div
      onClick={() => {}}
      className="bg-gray-40 relative flex aspect-video h-full w-full items-center justify-center overflow-hidden rounded-[16px]"
    >
      <div className="relative h-full w-full">
        {renderVideo}
        {renderAvatar}

        {/* Блок при отсутствии разрешений (по макету PreJoin) */}
        {isPermissionsBlocked && (
          <div className="bg-opacity-60 absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center">
            <p className="text-lg font-normal text-white">
              Хотите, чтобы другие участники услышали вас?
            </p>
            <ol className="list-inside list-decimal space-y-2 text-left text-sm text-white">
              {permissionsInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
                  {index === 0 && !isSafari() && <Settings className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
            <p className="text-gray-30 text-sm">
              Камеру или микрофон можно отключить в любой момент.
            </p>
            {permissionsButtonLabel && (
              <Button size="m" variant="ghost" onClick={openPermissionsDialog}>
                {permissionsButtonLabel}
              </Button>
            )}
          </div>
        )}

        {/* Сообщения о состоянии камеры (без блока разрешений) */}
        {!isPermissionsBlocked && hintMessage && (
          <div className="bg-opacity-60 absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center">
            <p className="text-lg font-normal text-white">{hintMessage}</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-5 left-5">
        <Controls
          audioTrack={audioTrack}
          videoTrack={videoTrack}
          disableMicroToggle={disableMicroToggle}
        />
      </div>
    </div>
  );
};
