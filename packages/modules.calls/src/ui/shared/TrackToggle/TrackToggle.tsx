/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrackToggleProps, useTrackVolume } from '@livekit/components-react';
import { Track, LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { motion } from 'framer-motion';
import {
  MicrophoneOff,
  Microphone,
  Conference,
  CameraOff,
  Screenshare,
  RedLine,
} from '@xipkg/icons';
import { useMemo } from 'react';
import { cn } from '@xipkg/utils';
import { useCannotUseDevice } from '../../../hooks/useCannotUseDevice';
import { openPermissionsDialog } from '../../../store/permissions';

interface ExtendedTrackToggleProps extends TrackToggleProps<any> {
  microTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
  screenShareTrack?: LocalVideoTrack;
  microEnabled?: boolean;
  videoEnabled?: boolean;
  screenShareEnabled?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const TrackToggle = ({
  microTrack,
  videoTrack,
  screenShareTrack,
  microEnabled,
  videoEnabled,
  screenShareEnabled,
  source,
  showIcon = true,
  onChange,
  className,
  ...props
}: ExtendedTrackToggleProps) => {
  const isMicPermissionBlocked = useCannotUseDevice('audioinput');
  const isCameraPermissionBlocked = useCannotUseDevice('videoinput');
  const permissionBlocked =
    source === Track.Source.Microphone
      ? isMicPermissionBlocked
      : source === Track.Source.Camera
        ? isCameraPermissionBlocked
        : false;

  // Для PreJoin используем собственную логику, так как useTrackToggle работает с треками в комнате
  const track =
    source === Track.Source.Microphone
      ? microTrack
      : source === Track.Source.Camera
        ? videoTrack
        : source === Track.Source.ScreenShare
          ? screenShareTrack
          : undefined;
  const enabled =
    source === Track.Source.Microphone
      ? microEnabled
      : source === Track.Source.Camera
        ? videoEnabled
        : source === Track.Source.ScreenShare
          ? screenShareEnabled
          : false;

  const toggle = () => {
    if (permissionBlocked) {
      openPermissionsDialog();
      return;
    }
    if (track) {
      const wasMuted = track.isMuted;
      const newEnabled = wasMuted;
      if (wasMuted) {
        track.unmute();
      } else {
        track.mute();
      }
      onChange?.(newEnabled, true);
    } else {
      onChange?.(!enabled, true);
    }
  };

  const trackVol = useTrackVolume(microTrack);

  const volume = Math.round(trackVol * 100);

  // При отсутствии разрешений показываем перечёркнутый значок (как выключенный)
  const iconEnabled = enabled && !permissionBlocked;

  const icon = useMemo(() => {
    switch (source) {
      case Track.Source.Microphone:
        return iconEnabled ? (
          <Microphone className="fill-green-100" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MicrophoneOff className="absolute" />
            <RedLine className="fill-red-80 absolute" />
          </div>
        );
      case Track.Source.Camera:
        return iconEnabled ? (
          <Conference className="fill-green-100" />
        ) : (
          <div className="relative flex items-center justify-center">
            <CameraOff className="absolute" />
            <RedLine className="fill-red-80 absolute" />
          </div>
        );
      case Track.Source.ScreenShare:
        return enabled ? (
          <Screenshare className="fill-green-100" />
        ) : (
          <Screenshare className="fill-gray-100" />
        );
      default:
        return null;
    }
  }, [source, iconEnabled, enabled]);

  const handleClick = () => {
    toggle();
  };

  const errorIndicator = permissionBlocked ? (
    <span
      className="bg-red-80 text-xxs-base-size absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded leading-none font-bold text-white"
      aria-hidden
    >
      !
    </span>
  ) : null;

  const buttonContent = (
    <>
      {showIcon && icon}
      {errorIndicator}
      {props.children}
    </>
  );

  const permissionBlockedStyles = permissionBlocked
    ? 'bg-red-0 border-2 border-red-80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-red-5'
    : '';

  if (source === Track.Source.Microphone) {
    return (
      <motion.button
        type="button"
        onClick={handleClick}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors',
          !permissionBlocked && 'bg-gray-0 hover:bg-gray-5',
          permissionBlockedStyles,
          className,
        )}
        animate={{
          background:
            !permissionBlocked && iconEnabled
              ? `linear-gradient(to top, var(--xi-green-20) 0%, transparent ${volume}%)`
              : undefined,
        }}
        style={{
          background:
            !permissionBlocked && iconEnabled
              ? `linear-gradient(to top, var(--xi-green-20) 0%, transparent ${volume}%)`
              : undefined,
        }}
        transition={{ duration: 1 }}
        data-umami-event="call-toggle-microphone"
        data-umami-event-state={enabled ? 'on' : 'off'}
        {...(props as unknown as any)}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors',
        !permissionBlocked && 'bg-gray-0 hover:bg-gray-5',
        !permissionBlocked && iconEnabled && 'bg-green-0 hover:bg-green-20',
        permissionBlockedStyles,
        className,
      )}
      data-umami-event={
        source === Track.Source.Camera
          ? 'call-toggle-camera'
          : source === Track.Source.ScreenShare
            ? 'call-toggle-screenshare'
            : 'call-toggle-track'
      }
      data-umami-event-state={enabled ? 'on' : 'off'}
      {...props}
    >
      {buttonContent}
    </button>
  );
};
